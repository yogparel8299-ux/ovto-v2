import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAudit } from "./run-utils";

export function priorityForPlan(planName?: string | null) {
  const plan = String(planName || "").toLowerCase();
  if (plan.includes("enterprise")) return 100;
  if (plan.includes("business")) return 75;
  if (plan.includes("pro")) return 50;
  if (plan.includes("starter")) return 25;
  return 10;
}

export async function getCompanyPriority(params: {
  supabase: SupabaseClient;
  companyId: string;
}) {
  const { data: subscription } = await params.supabase
    .from("subscriptions")
    .select("plan_name, status")
    .eq("company_id", params.companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return priorityForPlan(subscription?.plan_name);
}

export async function prioritizeAgentRuns(params: {
  supabase: SupabaseClient;
  limit?: number;
}) {
  const { data: runs, error } = await params.supabase
    .from("agent_runs")
    .select("id, company_id, trigger_payload")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(params.limit || 100);

  if (error) throw new Error(error.message);

  const updated: string[] = [];

  for (const run of runs || []) {
    const priority = await getCompanyPriority({
      supabase: params.supabase,
      companyId: run.company_id,
    });

    await params.supabase
      .from("agent_runs")
      .update({
        trigger_payload: {
          ...(run.trigger_payload || {}),
          priority,
          prioritized_at: new Date().toISOString(),
        },
      })
      .eq("id", run.id);

    updated.push(run.id);
  }

  return { updated };
}

export async function enqueueWorkflowJob(params: {
  supabase: SupabaseClient;
  companyId: string;
  workflowId: string;
  workflowRunId: string;
  payload?: Record<string, unknown>;
}) {
  const priority = await getCompanyPriority({
    supabase: params.supabase,
    companyId: params.companyId,
  });

  const { data, error } = await params.supabase
    .from("workflow_execution_queue")
    .insert({
      company_id: params.companyId,
      workflow_id: params.workflowId,
      workflow_run_id: params.workflowRunId,
      priority,
      status: "queued",
      available_at: new Date().toISOString(),
      payload: params.payload || {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "workflow_queue.enqueued",
    description: "Workflow run was added to execution queue.",
    metadata: {
      queue_id: data.id,
      workflow_id: params.workflowId,
      workflow_run_id: params.workflowRunId,
      priority,
    },
  });

  return data;
}

export async function claimWorkflowJob(params: {
  supabase: SupabaseClient;
  workerId: string;
}) {
  const now = new Date().toISOString();

  const { data: jobs, error } = await params.supabase
    .from("workflow_execution_queue")
    .select("*")
    .eq("status", "queued")
    .lte("available_at", now)
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) throw new Error(error.message);

  const job = jobs?.[0];
  if (!job) return null;

  const { data: claimed, error: claimError } = await params.supabase
    .from("workflow_execution_queue")
    .update({
      status: "locked",
      locked_at: now,
      worker_id: params.workerId,
    })
    .eq("id", job.id)
    .eq("status", "queued")
    .select()
    .single();

  if (claimError) return null;

  return claimed;
}
