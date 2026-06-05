import type { SupabaseClient } from "@supabase/supabase-js";

export async function createNotification(params: {
  supabase: SupabaseClient;
  companyId: string;
  userId?: string | null;
  title: string;
  message: string;
  notificationType: string;
  priority?: "low" | "normal" | "high" | "urgent";
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await params.supabase
    .from("notifications")
    .insert({
      company_id: params.companyId,
      user_id: params.userId || null,
      title: params.title,
      message: params.message,
      notification_type: params.notificationType,
      priority: params.priority || "normal",
      read: false,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function notifyCompanyMembers(params: {
  supabase: SupabaseClient;
  companyId: string;
  title: string;
  message: string;
  notificationType: string;
  priority?: "low" | "normal" | "high" | "urgent";
  metadata?: Record<string, unknown>;
}) {
  const { data: members } = await params.supabase
    .from("company_members")
    .select("user_id")
    .eq("company_id", params.companyId);

  const created: unknown[] = [];

  for (const member of members || []) {
    const notification = await createNotification({
      supabase: params.supabase,
      companyId: params.companyId,
      userId: member.user_id,
      title: params.title,
      message: params.message,
      notificationType: params.notificationType,
      priority: params.priority,
      metadata: params.metadata,
    });

    created.push(notification);
  }

  return created;
}

export async function createSystemNotification(params: {
  supabase: SupabaseClient;
  companyId: string;
  title: string;
  message: string;
  notificationType: string;
  priority?: "low" | "normal" | "high" | "urgent";
  metadata?: Record<string, unknown>;
}) {
  return notifyCompanyMembers({
    supabase: params.supabase,
    companyId: params.companyId,
    title: params.title,
    message: params.message,
    notificationType: params.notificationType,
    priority: params.priority,
    metadata: params.metadata,
  });
}
