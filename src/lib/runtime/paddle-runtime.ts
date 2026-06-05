import crypto from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { writeActivity, writeAudit } from "./run-utils";

export function verifyPaddleSignature(params: {
  rawBody: string;
  signature: string | null;
}) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;

  if (!secret) return true;

  if (!params.signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(params.rawBody)
    .digest("hex");

  return params.signature.includes(expected);
}

function normalizePaddleStatus(status: string) {
  const s = String(status || "").toLowerCase();

  if (s === "active") return "active";
  if (s === "trialing" || s === "trial") return "trialing";
  if (s === "past_due" || s === "past-due") return "past_due";
  if (s === "canceled" || s === "cancelled") return "canceled";
  if (s === "paused") return "paused";

  return s || "unknown";
}

function graceDate(days = 7) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function syncPaddleSubscription(params: {
  supabase: SupabaseClient;
  event: Record<string, any>;
}) {
  const eventType = params.event.event_type || params.event.type || "";
  const data = params.event.data || params.event;

  const providerSubscriptionId =
    data.id ||
    data.subscription_id ||
    data.provider_subscription_id;

  const providerCustomerId =
    data.customer_id ||
    data.customer?.id ||
    data.provider_customer_id;

  const customerEmail =
    data.customer?.email ||
    data.email ||
    data.customer_email ||
    "";

  const companyId =
    data.custom_data?.company_id ||
    data.metadata?.company_id ||
    data.company_id;

  if (!companyId) {
    throw new Error("Missing company_id in Paddle webhook custom_data");
  }

  if (!providerSubscriptionId) {
    throw new Error("Missing provider subscription id");
  }

  if (providerCustomerId) {
    const { data: existingCustomer } = await params.supabase
      .from("billing_customers")
      .select("*")
      .eq("company_id", companyId)
      .eq("provider", "paddle")
      .maybeSingle();

    if (existingCustomer) {
      await params.supabase
        .from("billing_customers")
        .update({
          provider_customer_id: providerCustomerId,
          email: customerEmail || existingCustomer.email,
        })
        .eq("id", existingCustomer.id);
    } else {
      await params.supabase.from("billing_customers").insert({
        company_id: companyId,
        provider: "paddle",
        provider_customer_id: providerCustomerId,
        email: customerEmail,
      });
    }
  }

  const status = normalizePaddleStatus(data.status);
  const periodStart =
    data.current_billing_period?.starts_at ||
    data.current_period_start ||
    data.started_at ||
    null;

  const periodEnd =
    data.current_billing_period?.ends_at ||
    data.current_period_end ||
    data.next_billed_at ||
    null;

  const planName =
    data.items?.[0]?.price?.name ||
    data.items?.[0]?.price?.description ||
    data.plan_name ||
    data.custom_data?.plan_name ||
    "Octo Plan";

  const shouldReadOnly =
    status === "canceled" ||
    status === "paused" ||
    status === "past_due";

  const graceUntil =
    status === "past_due"
      ? graceDate(7)
      : null;

  const { data: existingSub } = await params.supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", companyId)
    .eq("provider_subscription_id", providerSubscriptionId)
    .maybeSingle();

  let subscription;

  if (existingSub) {
    const updated = await params.supabase
      .from("subscriptions")
      .update({
        plan_name: planName,
        status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        read_only_mode: shouldReadOnly && status !== "past_due",
        grace_period_until: graceUntil,
      })
      .eq("id", existingSub.id)
      .select()
      .single();

    subscription = updated.data;
  } else {
    const inserted = await params.supabase
      .from("subscriptions")
      .insert({
        company_id: companyId,
        provider_subscription_id: providerSubscriptionId,
        plan_name: planName,
        status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        read_only_mode: shouldReadOnly && status !== "past_due",
        grace_period_until: graceUntil,
      })
      .select()
      .single();

    subscription = inserted.data;
  }

  await params.supabase
    .from("companies")
    .update({
      read_only_mode: shouldReadOnly && status !== "past_due",
      updated_at: new Date().toISOString(),
    })
    .eq("id", companyId);

  await writeActivity({
    supabase: params.supabase,
    companyId,
    type: "billing.subscription_synced",
    title: "Subscription updated",
    description: `Subscription synced from Paddle: ${status}`,
    relatedTable: "subscriptions",
    relatedId: subscription?.id || null,
  });

  await writeAudit({
    supabase: params.supabase,
    companyId,
    eventType: "billing.paddle_webhook_synced",
    description: `Paddle webhook processed: ${eventType}`,
    metadata: {
      event_type: eventType,
      status,
      provider_subscription_id: providerSubscriptionId,
    },
  });

  return {
    subscription,
    status,
    readOnly: shouldReadOnly && status !== "past_due",
  };
}

export async function enforceExpiredGracePeriods(params: {
  supabase: SupabaseClient;
}) {
  const now = new Date().toISOString();

  const { data: expiredSubs } = await params.supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "past_due")
    .not("grace_period_until", "is", null)
    .lt("grace_period_until", now)
    .eq("read_only_mode", false);

  const locked: string[] = [];

  for (const sub of expiredSubs || []) {
    await params.supabase
      .from("subscriptions")
      .update({
        read_only_mode: true,
      })
      .eq("id", sub.id);

    await params.supabase
      .from("companies")
      .update({
        read_only_mode: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sub.company_id);

    await writeAudit({
      supabase: params.supabase,
      companyId: sub.company_id,
      eventType: "billing.read_only_enabled",
      description: "Company moved to read-only after grace period expired.",
      metadata: {
        subscription_id: sub.id,
        grace_period_until: sub.grace_period_until,
      },
    });

    locked.push(sub.company_id);
  }

  return {
    locked,
  };
}

export async function getSubscriptionStatus(params: {
  supabase: SupabaseClient;
  companyId: string;
}) {
  const { data: subscription } = await params.supabase
    .from("subscriptions")
    .select("*")
    .eq("company_id", params.companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: company } = await params.supabase
    .from("companies")
    .select("id, read_only_mode")
    .eq("id", params.companyId)
    .maybeSingle();

  return {
    subscription,
    company,
    readOnly: Boolean(company?.read_only_mode || subscription?.read_only_mode),
  };
}
