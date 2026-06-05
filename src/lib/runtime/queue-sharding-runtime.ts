import type { SupabaseClient } from "@supabase/supabase-js";

export function getShardForCompany(companyId: string, shardCount = 16) {
  let hash = 0;

  for (let i = 0; i < companyId.length; i++) {
    hash = (hash * 31 + companyId.charCodeAt(i)) >>> 0;
  }

  return hash % shardCount;
}

export async function claimShardedAgentRun(params: {
  supabase: SupabaseClient;
  workerId: string;
  shardId: number;
  shardCount?: number;
}) {
  const shardCount = params.shardCount || 16;

  const { data: runs, error } = await params.supabase
    .from("agent_runs")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw new Error(error.message);

  const run = (runs || []).find(
    (item) => getShardForCompany(item.company_id, shardCount) === params.shardId
  );

  if (!run) return null;

  const { data: claimed, error: claimError } = await params.supabase
    .from("agent_runs")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
      trigger_payload: {
        ...(run.trigger_payload || {}),
        worker_id: params.workerId,
        shard_id: params.shardId,
      },
    })
    .eq("id", run.id)
    .eq("status", "queued")
    .select()
    .single();

  if (claimError) return null;

  return claimed;
}
