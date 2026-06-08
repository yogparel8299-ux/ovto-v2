import type { SupabaseClient } from "@supabase/supabase-js";

export async function generateExecutiveAnalytics(params:{
  supabase:SupabaseClient;
  companyId:string;
}){

  const { data:runsData, error:runsError } =
    await params.supabase
      .from("agent_usage_daily")
      .select("*")
      .eq("company_id", params.companyId);

  if(runsError){
    throw new Error(runsError.message);
  }

  const runs = runsData || [];

  const totalRuns =
    runs.reduce(
      (sum,row)=> sum + Number(row.runs_count || 0),
      0
    );

  const totalTokens =
    runs.reduce(
      (sum,row)=> sum + Number(row.total_tokens || 0),
      0
    );

  const totalCost =
    runs.reduce(
      (sum,row)=> sum + Number(row.cost_cents || 0),
      0
    );

  const activeAgents =
    new Set(
      runs.map(run=>run.agent_id)
    ).size;

  await params.supabase
    .from("company_analytics")
    .insert({
      company_id: params.companyId,
      total_agent_runs: totalRuns,
      total_cost_cents: totalCost,
      total_tokens: totalTokens,
      active_agents: activeAgents,
      average_cost_per_run_cents:
        totalRuns > 0
          ? Math.round(totalCost / totalRuns)
          : 0
    });

  return {
    totalRuns,
    totalTokens,
    totalCost,
    activeAgents
  };
}
