import type { SupabaseClient } from "@supabase/supabase-js";
import { nowIso, writeActivity, writeAudit } from "./run-utils";

async function getWorkflowSteps(params: {
  supabase: SupabaseClient;
  workflowId: string;
}) {
  const { data } = await params.supabase
    .from("workflow_steps")
    .select("*")
    .eq("workflow_id", params.workflowId)
    .order("position", { ascending: true });

  return data || [];
}

async function findAgent(params: {
  supabase: SupabaseClient;
  companyId: string;
  step: Record<string, any>;
}) {
  const step = params.step;
  const agentId = step.agent_id || step.config?.agent_id || step.metadata?.agent_id;

  if (agentId) {
    const { data } = await params.supabase
      .from("agents")
      .select("*")
      .eq("id", agentId)
      .eq("company_id", params.companyId)
      .maybeSingle();

    if (data) return data;
  }

  const agentName = step.agent_name || step.config?.agent_name || step.metadata?.agent_name;

  if (agentName) {
    const { data } = await params.supabase
      .from("agents")
      .select("*")
      .eq("company_id", params.companyId)
      .ilike("name", agentName)
      .maybeSingle();

    if (data) return data;
  }

  const { data } = await params.supabase
    .from("agents")
    .select("*")
    .eq("company_id", params.companyId)
    .limit(1);

  return data?.[0] || null;
}

function stepPrompt(params: {
  workflow: Record<string, any>;
  step: Record<string, any>;
  objective: string;
}) {
  return [
    `Workflow: ${params.workflow.name}`,
    params.workflow.description ? `Workflow description: ${params.workflow.description}` : "",
    `Objective: ${params.objective}`,
    params.step.name ? `Step: ${params.step.name}` : "",
    params.step.description ? `Step description: ${params.step.description}` : "",
    "Complete this workflow step and return a clear result.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function runWorkflow(params: {
  supabase: SupabaseClient;
  companyId: string;
  workflowId: string;
  objective: string;
  triggerSource?: string;
  triggerPayload?: Record<string, unknown>;
}) {
  const { supabase, companyId, workflowId, objective } = params;

  const { data: workflow, error: workflowError } = await supabase
    .from("workflows")
    .select("*")
    .eq("id", workflowId)
    .eq("company_id", companyId)
    .single();

  if (workflowError || !workflow) {
    throw new Error(workflowError?.message || "Workflow not found");
  }

  const { data: workflowRun, error: runError } = await supabase
    .from("workflow_runs")
    .insert({
      company_id: companyId,
      workflow_id: workflowId,
      status: "running",
      trigger_source: params.triggerSource ?? "manual",
      trigger_payload: params.triggerPayload ?? {},
      input: { objective },
      started_at: nowIso(),
    })
    .select()
    .single();

  if (runError) throw new Error(runError.message);

  await writeActivity({
    supabase,
    companyId,
    type: "workflow_run.started",
    title: "Workflow started",
    description: `Workflow "${workflow.name}" started.`,
    relatedTable: "workflow_runs",
    relatedId: workflowRun.id,
  });

  const steps = await getWorkflowSteps({ supabase, workflowId });
  const queuedRuns: any[] = [];

  if (!steps.length && Array.isArray(workflow.workers)) {
    for (const workerName of workflow.workers) {
      const { data: agent } = await supabase
        .from("agents")
        .select("*")
        .eq("company_id", companyId)
        .ilike("name", String(workerName))
        .maybeSingle();

      if (!agent) continue;

      const { data: agentRun, error } = await supabase
        .from("agent_runs")
        .insert({
          company_id: companyId,
          agent_id: agent.id,
          status: "queued",
          trigger_source: "workflow",
          trigger_payload: {
            workflow_id: workflowId,
            workflow_run_id: workflowRun.id,
          },
          input: {
            prompt: objective,
            workflow_name: workflow.name,
          },
        })
        .select()
        .single();

      if (!error && agentRun) queuedRuns.push(agentRun);
    }
  }

  for (const step of steps) {
    const stepType = String(step.step_type || step.type || "agent").toLowerCase();

    if (stepType === "approval") {
      const { data: approval } = await supabase
        .from("approvals")
        .insert({
          company_id: companyId,
          title: `Approval required: ${workflow.name}`,
          description: step.description || "Workflow requires human approval.",
          approval_type: "workflow_step",
          payload: {
            workflow_id: workflowId,
            workflow_run_id: workflowRun.id,
            step_id: step.id,
            objective,
          },
          status: "pending",
        })
        .select()
        .single();

      await supabase.from("workflow_run_steps").insert({
        company_id: companyId,
        workflow_run_id: workflowRun.id,
        workflow_step_id: step.id,
        status: "waiting_for_approval",
        input: { objective },
        output: { approval_id: approval?.id },
        started_at: nowIso(),
        finished_at: nowIso(),
      });

      continue;
    }

    const agent = await findAgent({ supabase, companyId, step });

    if (!agent) {
      await supabase.from("workflow_run_steps").insert({
        company_id: companyId,
        workflow_run_id: workflowRun.id,
        workflow_step_id: step.id,
        status: "failed",
        input: { objective },
        output: { error: "No agent available for workflow step." },
        started_at: nowIso(),
        finished_at: nowIso(),
      });
      continue;
    }

    const prompt = stepPrompt({ workflow, step, objective });

    const { data: agentRun, error } = await supabase
      .from("agent_runs")
      .insert({
        company_id: companyId,
        agent_id: agent.id,
        status: "queued",
        trigger_source: "workflow",
        trigger_payload: {
          workflow_id: workflowId,
          workflow_run_id: workflowRun.id,
          workflow_step_id: step.id,
        },
        input: {
          prompt,
          objective,
          workflow_name: workflow.name,
          step_name: step.name || null,
        },
      })
      .select()
      .single();

    if (!error && agentRun) {
      queuedRuns.push(agentRun);

      await supabase.from("workflow_run_steps").insert({
        company_id: companyId,
        workflow_run_id: workflowRun.id,
        workflow_step_id: step.id,
        agent_run_id: agentRun.id,
        status: "queued",
        input: { objective, prompt },
        started_at: nowIso(),
      });
    }
  }

  await supabase
    .from("workflow_runs")
    .update({
      status: queuedRuns.length ? "running" : "waiting",
      output: {
        queued_agent_runs: queuedRuns.map((run) => run.id),
      },
    })
    .eq("id", workflowRun.id);

  await writeAudit({
    supabase,
    companyId,
    eventType: "workflow_run.created",
    description: `Workflow run created with ${queuedRuns.length} queued agent runs.`,
    metadata: {
      workflow_id: workflowId,
      workflow_run_id: workflowRun.id,
      queued_agent_runs: queuedRuns.map((run) => run.id),
    },
  });

  return {
    workflowRun,
    queuedAgentRuns: queuedRuns,
  };
}
