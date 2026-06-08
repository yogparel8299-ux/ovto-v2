import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateForecast(params:{
  supabase:SupabaseClient;
  companyId:string;
}){

  const { data, error } =
    await params.supabase
      .from("agent_usage_daily")
      .select("*")
      .eq("company_id",params.companyId)
      .order("usage_date",{ ascending:false })
      .limit(30);

  if(error){
    throw new Error(error.message);
  }

  const rows = data || [];

  const avgRuns =
    rows.length > 0
      ? rows.reduce(
          (sum,row)=> sum + Number(row.runs_count || 0),
          0
        ) / rows.length
      : 0;

  const avgTokens =
    rows.length > 0
      ? rows.reduce(
          (sum,row)=> sum + Number(row.total_tokens || 0),
          0
        ) / rows.length
      : 0;

  const avgCost =
    rows.length > 0
      ? rows.reduce(
          (sum,row)=> sum + Number(row.cost_cents || 0),
          0
        ) / rows.length
      : 0;

  await params.supabase
    .from("company_forecasts")
    .insert({
      company_id: params.companyId,
      forecast_date: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000
      ).toISOString(),
      projected_cost_cents: Math.round(avgCost * 30),
      projected_runs: Math.round(avgRuns * 30),
      projected_tokens: Math.round(avgTokens * 30),
      confidence_score: 0.75
    });

  return {
    projectedRuns: Math.round(avgRuns * 30),
    projectedTokens: Math.round(avgTokens * 30),
    projectedCost: Math.round(avgCost * 30)
  };
}
