import type { SupabaseClient } from "@supabase/supabase-js";
import { runWorkflow } from "./workflow-runtime";
import { runSwarm } from "./swarm-runtime";
import { nowIso, writeActivity, writeAudit } from "./run-utils";

function evaluateCondition(config: Record<string, any>, input: Record<string, any>) {
  const field = config.field;
  const operator = config.operator || "equals";
  const expected = config.value;

  const actual = field ? input[field] : input.value;

  if (operator === "equals") return actual === expected;
  if (operator === "not_equals") return actual !== expected;
  if (operator === "contains") return String(actual || "").includes(String(expected || ""));
  if (operator === "exists") return actual !== undefined && actual !== null && actual !== "";

  return false;
}

async function queueAgentStep(params: {
  supabase: SupabaseClient;
  companyId: string;
  workflowRunId: string;
  step: Record<string, any>;
  objective: string;
  sharedInput: Record<string, any>;
}) {
  if (!params.step.agent_id) {
    throw new Error(`Workflow step "${params.step.name}" has no agent_id`);
  }

  const prompt = [
    `Workflow objective: ${params.objective}`,
    params.step.name ? `Step: ${params.step.name}` : "",
    params.step.config?.prompt ? `Instructions: ${params.step.config.prompt}` : "",
    "Complete this step and return a clear output.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const { data: agentRun, error } = await params.supabase
    .from("agent_runs")
    .insert({
      company_id: params.companyId,
      agent_id: params.step.agent_id,
      status: "queued",
      trigger_source: "workflow_advanced",
      trigger_payload: {
        workflow_run_id: params.workflowRunId,
        workflow_step_id: params.step.id,
        step_order: params.step.step_order,
      },
      input: {
        prompt,
        objective: params.objective,
        shared_input: params.sharedInput,
      },
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await params.supabase.from("workflow_run_steps").insert({
    company_id: params.companyId,
    workflow_run_id: params.workflowRunId,
    workflow_step_id: params.step.id,
    step_order: params.step.step_order,
    step_name: params.step.name,
    status: "queued",
    input: {
      objective: params.objective,
      shared_input: params.sharedInput,
    },
    output: {
      agent_run_id: agentRun.id,
    },
    started_at: nowIso(),
  });

  return agentRun;
}

async function queueTeamStep(params: {
  supabase: SupabaseClient;
  companyId: string;
  workflowRunId: string;
  step: Record<string, any>;
  objective: string;
}) {
  if (!params.step.team_id) {
    throw new Error(`Workflow step "${params.step.name}" has no team_id`);
  }

  const result = await runSwarm({
    supabase: params.supabase,
    companyId: params.companyId,
    teamId: params.step.team_id,
    objective: params.step.config?.objective || params.objective,
    triggerSource: "workflow_advanced",
  });

  await params.supabase.from("workflow_run_steps").insert({
    company_id: params.companyId,
    workflow_run_id: params.workflowRunId,
    workflow_step_id: params.step.id,
    step_order: params.step.step_order,
    step_name: params.step.name,
    status: "queued",
    input: { objective: params.objective },
    output: {
      team_run_id: result.teamRun.id,
      queued_agent_runs: result.queuedAgentRuns.map((run: any) => run.id),
    },
    started_at: nowIso(),
  });

  return result;
}

async function createApprovalStep(params: {
  supabase: SupabaseClient;
  companyId: string;
  workflowRunId: string;
  step: Record<string, any>;
  objective: string;
}) {
  const { data: approval, error } = await params.supabase
    .from("approvals")
    .insert({
      company_id: params.companyId,
      title: `Approval required: ${params.step.name}`,
      description: params.step.config?.description || params.step.metadata?.description || "Workflow requires approval.",
      approval_type: "workflow_step",
      payload: {
        workflow_run_id: params.workflowRunId,
        workflow_step_id: params.step.id,
        objective: params.objective,
      },
      status: "pending",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await params.supabase.from("workflow_run_steps").insert({
    company_id: params.companyId,
    workflow_run_id: params.workflowRunId,
    workflow_step_id: params.step.id,
    step_order: params.step.step_order,
    step_name: params.step.name,
    status: "waiting_for_approval",
    input: { objective: params.objective },
    output: { approval_id: approval.id },
    started_at: nowIso(),
    finished_at: nowIso(),
  });

  return approval;
}

export async function runAdvancedWorkflow(params: {
  supabase: SupabaseClient;
  companyId: string;
  workflowId: string;
  objective: string;
  input?: Record<string, any>;
  triggerSource?: string;
  triggerPayload?: Record<string, unknown>;
}) {
  const { supabase, companyId, workflowId, objective } = params;
  const sharedInput = params.input || {};

  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowId)
    .eq("company_id", companyId)
    .single();

  if (workflowError || !workflow) {
    throw new Error(workflowError?.message || "Workflow not found");
  }

  const { data: steps, error: stepsError } = await supabase
    .from("workflow_steps")
    .select("*")
    .eq("workflow_id", workflowId)
    .order("step_order", { ascending: true });

  if (stepsError) throw new Error(stepsError.message);

  if (!steps?.length) {
    return runWorkflow({
      supabase,
      companyId,
      workflowId,
      objective,
      triggerSource: params.triggerSource || "advanced_fallback",
      triggerPayload: params.triggerPayload || {},
    });
  }

  const executionPlan = {
    mode: "advanced",
    steps_count: steps.length,
    created_at: nowIso(),
  };

  const { data: workflowRun, error: runError } = await supabase
    .from("workflow_runs")
    .insert({
      company_id: companyId,
      workflow_id: workflowId,
      status: "running",
      trigger_source: params.triggerSource || "manual",
      trigger_payload: params.triggerPayload || {},
      execution_plan: executionPlan,
      input: {
        objective,
        ...sharedInput,
      },
      started_at: nowIso(),
    })
    .select()
    .single();

  if (runError) throw new Error(runError.message);

  const queued: unknown[] = [];
  const skipped: unknown[] = [];
  const approvals: unknown[] = [];

  const parallelGroups = new Map<string, Record<string, any>[]>();

  for (const step of steps) {
    const config = step.config || {};
    const group = config.parallel_group || `single_${step.id}`;

    if (!parallelGroups.has(group)) parallelGroups.set(group, []);
    parallelGroups.get(group)?.push(step);
  }

  for (const [, groupSteps] of parallelGroups) {
    const groupResults = await Promise.all(
      groupSteps.map(async (step) => {
        const type = String(step.step_type || "agent").toLowerCase();
        const config = step.config || {};

        if (type === "condition") {
          const passed = evaluateCondition(config, sharedInput);

          await supabase.from("workflow_run_steps").insert({
            company_id: companyId,
            workflow_run_id: workflowRun.id,
            workflow_step_id: step.id,
            step_order: step.step_order,
            step_name: step.name,
            status: passed ? "completed" : "skipped",
            input: sharedInput,
            output: {
              condition_passed: passed,
              config,
            },
            started_at: nowIso(),
            finished_at: nowIso(),
          });

          if (!passed) skipped.push(step.id);

          return {
            type: "condition",
            step_id: step.id,
            passed,
          };
        }

        if (type === "approval" || step.approval_required) {
          const approval = await createApprovalStep({
            supabase,
            companyId,
            workflowRunId: workflowRun.id,
            step,
            objective,
          });

          approvals.push(approval);

          return {
            type: "approval",
            step_id: step.id,
            approval_id: approval.id,
          };
        }

        if (type === "team" || type === "swarm") {
          const result = await queueTeamStep({
            supabase,
            companyId,
            workflowRunId: workflowRun.id,
            step,
            objective,
          });

          queued.push(result);

          return {
            type: "team",
            step_id: step.id,
            team_run_id: result.teamRun.id,
          };
        }

        const agentRun = await queueAgentStep({
          supabase,
          companyId,
          workflowRunId: workflowRun.id,
          step,
          objective,
          sharedInput,
        });

        queued.push(agentRun);

        return {
          type: "agent",
          step_id: step.id,
          agent_run_id: agentRun.id,
        };
      })
    );

    await writeAudit({
      supabase,
      companyId,
      eventType: "workflow.parallel_group.completed",
      description: "Workflow parallel group was processed.",
      metadata: {
        workflow_run_id: workflowRun.id,
        results: groupResults,
      },
    });
  }

  await supabase
    .from("workflow_runs")
    .update({
      status: approvals.length ? "waiting_for_approval" : "running",
      output: {
        queued,
        skipped,
        approvals,
      },
    })
    .eq("id", workflowRun.id);

  await writeActivity({
    supabase,
    companyId,
    type: "workflow.advanced_started",
    title: "Advanced workflow started",
    description: `Workflow "${workflow.name}" started with branching/parallel execution.`,
    relatedTable: "workflow_runs",
    relatedId: workflowRun.id,
  });

  return {
    workflowRun,
    queued,
    skipped,
    approvals,
  };
}
