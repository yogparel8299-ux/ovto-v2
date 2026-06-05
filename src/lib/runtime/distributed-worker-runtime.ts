import type { SupabaseClient } from "@supabase/supabase-js";

export async function registerWorker(params: {
  supabase: SupabaseClient;
  workerId: string;
  workerName: string;
  workerType: string;
  metadata?: Record<string, unknown>;
}) {
  const { data: existing } = await params.supabase
    .from("worker_registry")
    .select("*")
    .eq("worker_id", params.workerId)
    .maybeSingle();

  if (existing) {
    const { data, error } = await params.supabase
      .from("worker_registry")
      .update({
        worker_name: params.workerName,
        worker_type: params.workerType,
        status: "online",
        last_seen_at: new Date().toISOString(),
        metadata: params.metadata || {},
      })
      .eq("worker_id", params.workerId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  const { data, error } = await params.supabase
    .from("worker_registry")
    .insert({
      worker_id: params.workerId,
      worker_name: params.workerName,
      worker_type: params.workerType,
      status: "online",
      last_seen_at: new Date().toISOString(),
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function workerHeartbeat(params: {
  supabase: SupabaseClient;
  workerId: string;
  cpuPercent?: number;
  memoryPercent?: number;
  activeJobs?: number;
  metadata?: Record<string, unknown>;
}) {
  await params.supabase.from("worker_heartbeats").insert({
    worker_id: params.workerId,
    cpu_percent: params.cpuPercent || 0,
    memory_percent: params.memoryPercent || 0,
    active_jobs: params.activeJobs || 0,
    metadata: params.metadata || {},
  });

  await params.supabase
    .from("worker_registry")
    .update({
      status: "online",
      last_seen_at: new Date().toISOString(),
    })
    .eq("worker_id", params.workerId);

  return { ok: true };
}

export async function markOfflineWorkers(params: {
  supabase: SupabaseClient;
  timeoutSeconds?: number;
}) {
  const timeout = params.timeoutSeconds || 90;
  const cutoff = new Date(Date.now() - timeout * 1000).toISOString();

  const { data, error } = await params.supabase
    .from("worker_registry")
    .update({ status: "offline" })
    .lt("last_seen_at", cutoff)
    .neq("status", "offline")
    .select();

  if (error) throw new Error(error.message);

  return { offlineWorkers: data || [] };
}
