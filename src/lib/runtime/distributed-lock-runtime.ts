import type { SupabaseClient } from "@supabase/supabase-js";

export async function acquireLock(params: {
  supabase: SupabaseClient;
  companyId?: string | null;
  lockKey: string;
  workerId: string;
  ttlSeconds?: number;
  metadata?: Record<string, unknown>;
}) {
  const ttl = params.ttlSeconds || 60;
  const now = new Date().toISOString();
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

  await params.supabase
    .from("distributed_locks")
    .delete()
    .eq("lock_key", params.lockKey)
    .lt("expires_at", now);

  const { data, error } = await params.supabase
    .from("distributed_locks")
    .insert({
      company_id: params.companyId || null,
      lock_key: params.lockKey,
      locked_by_worker: params.workerId,
      expires_at: expiresAt,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) {
    return {
      acquired: false,
      lock: null,
      reason: error.message,
    };
  }

  return {
    acquired: true,
    lock: data,
  };
}

export async function releaseLock(params: {
  supabase: SupabaseClient;
  lockKey: string;
  workerId: string;
}) {
  const { error } = await params.supabase
    .from("distributed_locks")
    .delete()
    .eq("lock_key", params.lockKey)
    .eq("locked_by_worker", params.workerId);

  if (error) throw new Error(error.message);

  return { released: true };
}

export async function extendLock(params: {
  supabase: SupabaseClient;
  lockKey: string;
  workerId: string;
  ttlSeconds?: number;
}) {
  const ttl = params.ttlSeconds || 60;
  const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();

  const { data, error } = await params.supabase
    .from("distributed_locks")
    .update({ expires_at: expiresAt })
    .eq("lock_key", params.lockKey)
    .eq("locked_by_worker", params.workerId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}
