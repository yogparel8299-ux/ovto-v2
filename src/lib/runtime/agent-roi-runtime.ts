import type { SupabaseClient } from "@supabase/supabase-js";

export async function calculateAgentROI(params: {
  supabase: SupabaseClient;
  companyId: string;
  agentId: string;
}) {
  const { data, error } = await params.supabase
    .from("agent_runs")
    .select("cost_cents")
    .eq("company_id", params.companyId)
    .eq("agent_id", params.agentId);

  if (error) throw new Error(error.message);

  const runs = data || [];

  const totalCost = runs.reduce(
    (sum, r) => sum + Number(r.cost_cents || 0),
    0
  );

  const estimatedValue = runs.length * 500;

  const roi =
    totalCost === 0
      ? 100
      : Math.round(((estimatedValue - totalCost) / totalCost) * 100);

  await params.supabase
    .from("agents")
    .update({
      roi_score: roi,
    })
    .eq("id", params.agentId)
    .eq("company_id", params.companyId);

  return {
    totalCost,
    estimatedValue,
    roi,
  };
}
