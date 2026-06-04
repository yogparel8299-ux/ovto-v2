import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAudit } from "./run-utils";

export function estimateModelCostCents(params: {
  totalTokens?: number | null;
  model?: string | null;
  keySource?: "byok" | "platform";
}) {
  if (params.keySource === "byok") return 0;

  const tokens = params.totalTokens || 0;
  if (tokens <= 0) return 0;

  const model = (params.model || "").toLowerCase();

  if (model.includes("gpt-4o-mini")) return Math.ceil(tokens * 0.0001);
  if (model.includes("gemini")) return Math.ceil(tokens * 0.0001);
  if (model.includes("gpt-4o")) return Math.ceil(tokens * 0.001);
  if (model.includes("claude")) return Math.ceil(tokens * 0.001);
  if (model.includes("grok")) return Math.ceil(tokens * 0.001);

  return Math.ceil(tokens * 0.0005);
}

export async function getBillingStatus(params: {
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

  const { data: wallet } = await params.supabase
    .from("credit_wallets")
    .select("*")
    .eq("company_id", params.companyId)
    .maybeSingle();

  return {
    subscription,
    wallet,
    active:
      subscription?.status === "active" ||
      subscription?.status === "trialing",
    readOnly: Boolean(subscription?.read_only_mode),
    creditBalanceCents: Number(wallet?.balance_cents || 0),
  };
}

export async function ensureCompanyCanRun(params: {
  supabase: SupabaseClient;
  companyId: string;
  estimatedCostCents?: number;
}) {
  const billing = await getBillingStatus({
    supabase: params.supabase,
    companyId: params.companyId,
  });

  if (billing.readOnly) {
    return {
      allowed: false,
      reason: "read_only_mode",
      ...billing,
    };
  }

  if (billing.active) {
    return {
      allowed: true,
      reason: "subscription_active",
      ...billing,
    };
  }

  if (billing.creditBalanceCents >= (params.estimatedCostCents || 1)) {
    return {
      allowed: true,
      reason: "credits_available",
      ...billing,
    };
  }

  return {
    allowed: false,
    reason: "no_active_subscription_or_credits",
    ...billing,
  };
}

export async function recordUsage(params: {
  supabase: SupabaseClient;
  companyId: string;
  sourceType: string;
  sourceId: string;
  unitsUsed: number;
  costCents: number;
}) {
  await params.supabase.from("usage_metering").insert({
    company_id: params.companyId,
    source_type: params.sourceType,
    source_id: params.sourceId,
    units_used: params.unitsUsed,
    cost_cents: params.costCents,
  });
}

export async function deductCredits(params: {
  supabase: SupabaseClient;
  companyId: string;
  amountCents: number;
  sourceType: string;
  sourceId: string;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  if (params.amountCents <= 0) return { deducted: false };

  const { data: wallet } = await params.supabase
    .from("credit_wallets")
    .select("*")
    .eq("company_id", params.companyId)
    .maybeSingle();

  if (!wallet) {
    throw new Error("Credit wallet not found");
  }

  const current = Number(wallet.balance_cents || 0);
  const next = Math.max(0, current - params.amountCents);

  await params.supabase
    .from("credit_wallets")
    .update({ balance_cents: next })
    .eq("id", wallet.id);

  await params.supabase.from("credit_transactions").insert({
    company_id: params.companyId,
    wallet_id: wallet.id,
    amount_cents: -Math.abs(params.amountCents),
    transaction_type: "debit",
    description: params.description,
    metadata: {
      ...(params.metadata || {}),
      source_type: params.sourceType,
      source_id: params.sourceId,
      previous_balance_cents: current,
      new_balance_cents: next,
    },
  });

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "credits.deducted",
    description: params.description,
    metadata: {
      amount_cents: params.amountCents,
      source_type: params.sourceType,
      source_id: params.sourceId,
      previous_balance_cents: current,
      new_balance_cents: next,
    },
  });

  return {
    deducted: true,
    balanceCents: next,
  };
}

export async function addCredits(params: {
  supabase: SupabaseClient;
  companyId: string;
  amountCents: number;
  description: string;
  metadata?: Record<string, unknown>;
}) {
  let { data: wallet } = await params.supabase
    .from("credit_wallets")
    .select("*")
    .eq("company_id", params.companyId)
    .maybeSingle();

  if (!wallet) {
    const created = await params.supabase
      .from("credit_wallets")
      .insert({
        company_id: params.companyId,
        balance_cents: params.amountCents,
        currency: "usd",
      })
      .select()
      .single();

    wallet = created.data;
  } else {
    await params.supabase
      .from("credit_wallets")
      .update({
        balance_cents: Number(wallet.balance_cents || 0) + params.amountCents,
      })
      .eq("id", wallet.id);
  }

  if (wallet) {
    await params.supabase.from("credit_transactions").insert({
      company_id: params.companyId,
      wallet_id: wallet.id,
      amount_cents: Math.abs(params.amountCents),
      transaction_type: "credit",
      description: params.description,
      metadata: params.metadata || {},
    });
  }

  return { added: true };
}
