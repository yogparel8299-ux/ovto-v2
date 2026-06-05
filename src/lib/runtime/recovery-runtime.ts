import type { SupabaseClient } from "@supabase/supabase-js";
import { createSystemNotification } from "./notification-runtime";
import { writeAudit } from "./run-utils";

const MAX_RETRIES = 3;

function getRetryCount(run: Record<string, any>) {
  const payload = run.trigger_payload || {};
  return Number(payload.retry_count || 0);
}

export async function retryFailedAgentRuns(params: {
  supabase: SupabaseClient;
  limit?: number;
}) {
  const { supabase } = params;
  const limit = params.limit || 25;

  const { data: failedRuns, error } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("status", "failed")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw new Error(error.message);

  const retried: string[] = [];
  const exhausted: string[] = [];

  for (const run of failedRuns || []) {
    const retryCount = getRetryCount(run);

    if (retryCount >= MAX_RETRIES) {
      exhausted.push(run.id);

      await createSystemNotification({
        supabase,
        companyId: run.company_id,
        title: "Agent run failed permanently",
        message: run.error_message || "An AI worker failed after all retry attempts.",
        notificationType: "agent_run_failed",
        priority: "high",
        metadata: {
          agent_run_id: run.id,
          agent_id: run.agent_id,
          retry_count: retryCount,
        },
      });

      await writeAudit({
        supabase,
        companyId: run.company_id,
        eventType: "agent_run.retry_exhausted",
        description: "Agent run reached maximum retry attempts.",
        metadata: {
          agent_run_id: run.id,
          retry_count: retryCount,
        },
      });

      continue;
    }

    await supabase
      .from("agent_runs")
      .update({
        status: "queued",
        error_message: null,
        started_at: null,
        finished_at: null,
        trigger_payload: {
          ...(run.trigger_payload || {}),
          retry_count: retryCount + 1,
          retried_at: new Date().toISOString(),
        },
      })
      .eq("id", run.id);

    retried.push(run.id);

    await writeAudit({
      supabase,
      companyId: run.company_id,
      eventType: "agent_run.retried",
      description: "Agent run was re-queued for retry.",
      metadata: {
        agent_run_id: run.id,
        retry_count: retryCount + 1,
      },
    });
  }

  return {
    scanned: failedRuns?.length || 0,
    retried,
    exhausted,
  };
}

export async function markStuckRunsFailed(params: {
  supabase: SupabaseClient;
  minutes?: number;
}) {
  const minutes = params.minutes || 30;
  const cutoff = new Date(Date.now() - minutes * 60 * 1000).toISOString();

  const { data: stuckRuns, error } = await params.supabase
    .from("agent_runs")
    .select("*")
    .eq("status", "running")
    .lt("started_at", cutoff);

  if (error) throw new Error(error.message);

  for (const run of stuckRuns || []) {
    await params.supabase
      .from("agent_runs")
      .update({
        status: "failed",
        error_message: `Run timed out after ${minutes} minutes.`,
        finished_at: new Date().toISOString(),
      })
      .eq("id", run.id);

    await createSystemNotification({
      supabase: params.supabase,
      companyId: run.company_id,
      title: "Agent run timed out",
      message: `An AI worker run timed out after ${minutes} minutes.`,
      notificationType: "agent_run_timeout",
      priority: "high",
      metadata: {
        agent_run_id: run.id,
        agent_id: run.agent_id,
      },
    });
  }

  return {
    failed: stuckRuns?.map((run) => run.id) || [],
  };
}
