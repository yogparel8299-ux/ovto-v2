import type { SupabaseClient } from "@supabase/supabase-js";

export function normalizeText(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return JSON.stringify(value);
}

export function nowIso() {
  return new Date().toISOString();
}

export async function writeActivity(params: {
  supabase: SupabaseClient;
  companyId: string;
  agentId?: string | null;
  type: string;
  title: string;
  description?: string;
  relatedTable?: string;
  relatedId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await params.supabase.from("activity_feed").insert({
    company_id: params.companyId,
    actor_agent_id: params.agentId ?? null,
    activity_type: params.type,
    title: params.title,
    description: params.description ?? "",
    related_table: params.relatedTable ?? null,
    related_id: params.relatedId ?? null,
    metadata: params.metadata ?? {},
  });
}

export async function writeAudit(params: {
  supabase: SupabaseClient;
  companyId: string;
  eventType: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  await params.supabase.from("audit_events").insert({
    company_id: params.companyId,
    event_type: params.eventType,
    description: params.description,
    metadata: params.metadata ?? {},
  });
}
