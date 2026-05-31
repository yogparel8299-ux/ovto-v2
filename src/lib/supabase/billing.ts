import { getSupabase } from "./client";

export type BillingSubscription = {
  id: string;
  planName: string;
  status: string | null;
  amountCents: number | null;
  currency: string | null;
};

export async function fetchBillingSubscription(
  companyId: string
): Promise<BillingSubscription | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("id, plan_name, status, amount_cents, currency")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    planName: data.plan_name,
    status: data.status,
    amountCents: data.amount_cents,
    currency: data.currency,
  };
}
