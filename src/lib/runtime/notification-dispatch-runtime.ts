import type { SupabaseClient } from "@supabase/supabase-js";

async function logDelivery(params: {
  supabase: SupabaseClient;
  companyId: string;
  notificationId: string;
  channel: string;
  recipient: string;
  status: string;
  provider: string;
  responsePayload?: Record<string, unknown>;
  errorMessage?: string;
}) {
  await params.supabase.from("notification_delivery_logs").insert({
    company_id: params.companyId,
    notification_id: params.notificationId,
    channel: params.channel,
    recipient: params.recipient,
    status: params.status,
    provider: params.provider,
    response_payload: params.responsePayload || {},
    error_message: params.errorMessage || null,
  });
}

async function sendEmail(params: {
  to: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return {
      skipped: true,
      reason: "RESEND_API_KEY missing",
    };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.NOTIFICATION_FROM_EMAIL || "Octo <notifications@octo.ai>",
      to: params.to,
      subject: params.subject,
      text: params.message,
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || "Email delivery failed");
  }

  return json;
}

async function sendWebhook(params: {
  url: string;
  title: string;
  message: string;
}) {
  const res = await fetch(params.url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: `*${params.title}*\n${params.message}`,
      content: `**${params.title}**\n${params.message}`,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Webhook delivery failed");
  }

  return { ok: true, response: text };
}

export async function dispatchNotifications(params: {
  supabase: SupabaseClient;
  limit?: number;
}) {
  const { data: notifications, error } = await params.supabase
    .from("notifications")
    .select("*")
    .eq("delivered", false)
    .order("created_at", { ascending: true })
    .limit(params.limit || 25);

  if (error) throw new Error(error.message);

  const delivered: string[] = [];
  const failed: string[] = [];

  for (const notification of notifications || []) {
    try {
      let email: string | null = null;

      if (notification.user_id) {
        const { data: profile } = await params.supabase
          .from("profiles")
          .select("email")
          .eq("id", notification.user_id)
          .maybeSingle();

        email = profile?.email || null;
      }

      if (email) {
        const result = await sendEmail({
          to: email,
          subject: notification.title,
          message: notification.message,
        });

        await logDelivery({
          supabase: params.supabase,
          companyId: notification.company_id,
          notificationId: notification.id,
          channel: "email",
          recipient: email,
          status: "sent",
          provider: "resend",
          responsePayload: result as Record<string, unknown>,
        });
      }

      const slackWebhook = process.env.SLACK_NOTIFICATION_WEBHOOK_URL;
      if (slackWebhook) {
        const result = await sendWebhook({
          url: slackWebhook,
          title: notification.title,
          message: notification.message,
        });

        await logDelivery({
          supabase: params.supabase,
          companyId: notification.company_id,
          notificationId: notification.id,
          channel: "slack",
          recipient: "workspace_webhook",
          status: "sent",
          provider: "slack_webhook",
          responsePayload: result,
        });
      }

      const discordWebhook = process.env.DISCORD_NOTIFICATION_WEBHOOK_URL;
      if (discordWebhook) {
        const result = await sendWebhook({
          url: discordWebhook,
          title: notification.title,
          message: notification.message,
        });

        await logDelivery({
          supabase: params.supabase,
          companyId: notification.company_id,
          notificationId: notification.id,
          channel: "discord",
          recipient: "server_webhook",
          status: "sent",
          provider: "discord_webhook",
          responsePayload: result,
        });
      }

      await params.supabase
        .from("notifications")
        .update({ delivered: true })
        .eq("id", notification.id);

      delivered.push(notification.id);
    } catch (error) {
      failed.push(notification.id);

      await logDelivery({
        supabase: params.supabase,
        companyId: notification.company_id,
        notificationId: notification.id,
        channel: "unknown",
        recipient: "unknown",
        status: "failed",
        provider: "notification_dispatcher",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return {
    scanned: notifications?.length || 0,
    delivered,
    failed,
  };
}
