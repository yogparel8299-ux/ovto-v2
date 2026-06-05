import type { SupabaseClient } from "@supabase/supabase-js";
import { acquireLock, releaseLock } from "./distributed-lock-runtime";

export async function electLeader(params: {
  supabase: SupabaseClient;
  workerId: string;
  role: string;
}) {
  const lock = await acquireLock({
    supabase: params.supabase,
    lockKey: `leader:${params.role}`,
    workerId: params.workerId,
    ttlSeconds: 45,
    metadata: {
      role: params.role,
      elected_at: new Date().toISOString(),
    },
  });

  return {
    isLeader: lock.acquired,
    lock,
  };
}

export async function resignLeader(params: {
  supabase: SupabaseClient;
  workerId: string;
  role: string;
}) {
  return releaseLock({
    supabase: params.supabase,
    lockKey: `leader:${params.role}`,
    workerId: params.workerId,
  });
}
