import type { SupabaseClient } from "@supabase/supabase-js";
import { createSystemNotification } from "./notification-runtime";
import { writeAudit } from "./run-utils";

export async function getQueueHealth(params: {
  supabase: SupabaseClient;
  companyId?: string;
}) {
  let agentQuery = params.supabase
    .from("agent_runs")
    .select("id, company_id, status, started_at, created_at");

  if (params.companyId) agentQuery = agentQuery.eq("company_id", params.companyId);

  const { data: agentRuns } = await agentQuery;

  let workflowQuery = params.supabase
    .from("workflow_execution_queue")
    .select("id, company_id, priority, status, available_at, locked_at, worker_id, created_at");

  if (params.companyId) workflowQuery = workflowQuery.eq("company_id", params.companyId);

  const { data: workflowQueue } = await workflowQuery;

  const counts = {
    agentQueued: 0,
    agentRunning: 0,
    agentFailed: 0,
    workflowQueued: 0,
    workflowRunning: 0,
    workflowFailed: 0,
  };

  for (const run of agentRuns || []) {
    if (run.status === "queued") counts.agentQueued++;
    if (run.status === "running") counts.agentRunning++;
    if (run.status === "failed") counts.agentFailed++;
  }

  for (const job of workflowQueue || []) {
    if (job.status === "queued") counts.workflowQueued++;
    if (job.status === "running" || job.status === "locked") counts.workflowRunning++;
    if (job.status === "failed") counts.workflowFailed++;
  }

  return {
    counts,
    agentRuns: agentRuns || [],
    workflowQueue: workflowQueue || [],
    generatedAt: new Date().toISOString(),
  };
}

export async function recoverStuckQueue(params: {
  supabase: SupabaseClient;
  minutes?: number;
}) {
  const minutes = params.minutes || 30;
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();

  const { data: stuckAgentRuns } = await params.supabase
    .from("agent_runs")
    .select("*")
    .eq("status", "running")
    .lt("started_at", cutoff);

  const { data: stuckWorkflowJobs } = await params.supabase
    .from("workflow_execution_queue")
    .select("*")
    .in("status", ["running", "locked"])
    .lt("locked_at", cutoff);

  for (const run of stuckAgentRuns || []) {
    await params.supabase
      .from("agent_runs")
      .update({
        status: "failed",
        error_message: `Worker timeout after ${minutes} minutes.`,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    await params.supabase.from("agent_failures").insert({
      company_id: run.company_id,
      agent_id: run.agent_id,
      run_id: run.id,
      failure_type: "worker_timeout",
      error_message: `Worker timeout after ${minutes} minutes.`,
      recovery_status: "needs_retry",
    });

    await createSystemNotification({
      supabase: params.supabase,
      companyId: run.company_id,
      title: "Agent worker timed out",
      message: "A running AI worker timed out and was marked failed.",
      notificationType: "worker_timeout",
      priority: "high",
      metadata: {
        agent_run_id: run.id,
      },
    });
  }

  for (const job of stuckWorkflowJobs || []) {
    await params.supabase
      .from("workflow_execution_queue")
      .update({
        status: "queued",
        locked_at: null,
        worker_id: null,
      })
      .eq("id", job.id);

    await writeAudit({
      supabase: params.supabase,
      companyId: job.company_id,
      eventType: "workflow_queue.recovered",
      description: "Stuck workflow queue job was released back to queue.",
      metadata: {
        queue_id: job.id,
        workflow_id: job.workflow_id,
        workflow_run_id: job.workflow_run_id,
      },
    });
  }

  return {
    recoveredAgentRuns: stuckAgentRuns?.map((run) => run.id) || [],
    recoveredWorkflowJobs: stuckWorkflowJobs?.map((job) => job.id) || [],
  };
}

export async function queueScalingRecommendation(params: {
  supabase: SupabaseClient;
}) {
  const health = await getQueueHealth({ supabase: params.supabase });

  const queued = health.counts.agentQueued + health.counts.workflowQueued;
  const running = health.counts.agentRunning + health.counts.workflowRunning;

  let recommendedWorkers = 1;

  if (queued > 500) recommendedWorkers = 20;
  else if (queued > 250) recommendedWorkers = 10;
  else if (queued > 100) recommendedWorkers = 5;
  else if (queued > 25) recommendedWorkers = 3;

  return {
    queued,
    running,
    recommendedWorkers,
    recommendation:
      recommendedWorkers === 1
        ? "Current worker capacity is enough."
        : `Scale worker pool to at least ${recommendedWorkers} workers.`,
  };
}
