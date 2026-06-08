import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateProfitabilityReport(params: {
  supabase: SupabaseClient;
  companyId: string;
}) {
  const { data, error } =
    await params.supabase
      .from("credit_transactions")
      .select("*")
      .eq("company_id", params.companyId);

  if (error) {
    throw new Error(error.message);
  }

  const transactions = data || [];

  const revenue =
    transactions
      .filter(
        (t) => t.transaction_type === "credit_purchase"
      )
      .reduce(
        (sum, t) =>
          sum + Number(t.amount_cents || 0),
        0
      );

  const expenses =
    transactions
      .filter(
        (t) => t.transaction_type === "expense"
      )
      .reduce(
        (sum, t) =>
          sum + Number(t.amount_cents || 0),
        0
      );

  const profit =
    revenue - expenses;

  const margin =
    revenue > 0
      ? profit / revenue
      : 0;

  const { error: insertError } =
    await params.supabase
      .from("profitability_reports")
      .insert({
        company_id: params.companyId,
        revenue_cents: revenue,
        expenses_cents: expenses,
        profit_cents: profit,
        profit_margin: margin,
      });

  if (insertError) {
    throw new Error(insertError.message);
  }

  return {
    revenue,
    expenses,
    profit,
    margin,
  };
}