import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveModelRoute } from "./model-router";
import { callModel } from "./model-call";
import { createDelegation } from "./delegation-runtime";
import { writeActivity, writeAudit } from "./run-utils";

export async function decomposeGoal(params: {
  supabase: SupabaseClient;
  companyId: string;
  plannerAgentId: string;
  goal: string;
}) {
  const { data: planner, error } = await params.supabase
    .from("agents")
    .select("*")
    .eq("id", params.plannerAgentId)
    .eq("company_id", params.companyId)
    .single();

  if (error || !planner) throw new Error(error?.message || "Planner agent not found");

  const route = await resolveModelRoute({
    supabase: params.supabase,
    companyId: params.companyId,
    agent: planner,
  });

  const result = await callModel({
    route,
    systemPrompt:
      "You are an autonomous business planning agent. Break large company goals into executable tasks. Return ONLY valid JSON.",
    userPrompt: `
Goal:
${params.goal}

Return JSON exactly like:
{
  "plan_title": "string",
  "summary": "string",
  "tasks": [
    {
      "title": "string",
      "description": "string",
      "priority": "low|normal|high|urgent",
      "suggested_role": "Marketing|Sales|Finance|Operations|Support|Research|Legal"
    }
  ]
}
`,
  });

  let parsed: any;

  try {
    parsed = JSON.parse(result.output);
  } catch {
    parsed = {
      plan_title: "Autonomous Plan",
      summary: result.output,
      tasks: [
        {
          title: "Review generated plan",
          description: result.output,
          priority: "normal",
          suggested_role: "Operations",
        },
      ],
    };
  }

  await writeActivity({
    supabase: params.supabase,
    companyId: params.companyId,
    agentId: params.plannerAgentId,
    type: "planning.goal_decomposed",
    title: "Goal decomposed",
    description: parsed.plan_title || params.goal,
    relatedTable: "agents",
    relatedId: params.plannerAgentId,
  });

  return parsed;
}

export async function createPlanTasks(params: {
  supabase: SupabaseClient;
  companyId: string;
  plannerAgentId: string;
  goal: string;
}) {
  const plan = await decomposeGoal({
    supabase: params.supabase,
    companyId: params.companyId,
    plannerAgentId: params.plannerAgentId,
    goal: params.goal,
  });

  const createdTasks: any[] = [];

  for (const task of plan.tasks || []) {
    const { data: agent } = await params.supabase
      .from("agents")
      .select("*")
      .eq("company_id", params.companyId)
      .ilike("role", task.suggested_role || "Operations")
      .limit(1)
      .maybeSingle();

    const { data, error } = await params.supabase
      .from("agent_tasks")
      .insert({
        company_id: params.companyId,
        agent_id: agent?.id || params.plannerAgentId,
        title: task.title,
        description: task.description,
        status: "queued",
        priority: task.priority || "normal",
        input: {
          goal: params.goal,
          suggested_role: task.suggested_role || null,
          plan_title: plan.plan_title || null,
        },
        assigned_by: params.plannerAgentId,
      })
      .select()
      .single();

    if (!error && data) createdTasks.push(data);
  }

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "planning.tasks_created",
    description: "Autonomous planning created executable tasks.",
    metadata: {
      goal: params.goal,
      tasks_created: createdTasks.length,
    },
  });

  return {
    plan,
    tasks: createdTasks,
  };
}

export async function executePlanTasks(params: {
  supabase: SupabaseClient;
  companyId: string;
  plannerAgentId: string;
  taskIds: string[];
}) {
  const queuedRuns: any[] = [];

  for (const taskId of params.taskIds) {
    const { data: task } = await params.supabase
      .from("agent_tasks")
      .select("*")
      .eq("id", taskId)
      .eq("company_id", params.companyId)
      .maybeSingle();

    if (!task) continue;

    const { data: run, error } = await params.supabase
      .from("agent_runs")
      .insert({
        company_id: params.companyId,
        agent_id: task.agent_id,
        task_id: task.id,
        status: "queued",
        trigger_source: "autonomous_plan",
        trigger_payload: {
          planner_agent_id: params.plannerAgentId,
          task_id: task.id,
        },
        input: {
          prompt: `${task.title}\n\n${task.description}`,
          task_input: task.input || {},
        },
      })
      .select()
      .single();

    if (!error && run) {
      queuedRuns.push(run);

      await params.supabase
        .from("agent_tasks")
        .update({
          status: "running",
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);
    }
  }

  return {
    queuedRuns,
  };
}

export async function delegatePlanToAgents(params: {
  supabase: SupabaseClient;
  companyId: string;
  plannerAgentId: string;
  goal: string;
}) {
  const created = await createPlanTasks({
    supabase: params.supabase,
    companyId: params.companyId,
    plannerAgentId: params.plannerAgentId,
    goal: params.goal,
  });

  const delegations: any[] = [];

  for (const task of created.tasks) {
    if (!task.agent_id || task.agent_id === params.plannerAgentId) continue;

    const delegation = await createDelegation({
      supabase: params.supabase,
      companyId: params.companyId,
      fromAgentId: params.plannerAgentId,
      toAgentId: task.agent_id,
      task: `${task.title}\n\n${task.description}`,
      context: {
        source: "autonomous_planning",
        goal: params.goal,
        task_id: task.id,
      },
    });

    delegations.push(delegation);
  }

  return {
    plan: created.plan,
    tasks: created.tasks,
    delegations,
  };
}
