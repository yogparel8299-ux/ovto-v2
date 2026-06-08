import type { SupabaseClient } from "@supabase/supabase-js";

export async function calculateAgentPerformance(params: {
  supabase: SupabaseClient;
  companyId: string;
  agentId: string;
}) {
  const { data, error } = await params.supabase
    .from("agent_runs")
    .select("*")
    .eq("company_id", params.companyId)
    .eq("agent_id", params.agentId);

  if (error) throw new Error(error.message);

  const runs = data || [];

  const totalRuns = runs.length;
  const successfulRuns = runs.filter((r) => r.status === "completed").length;
  const failedRuns = runs.filter((r) => r.status === "failed").length;

  const successRate =
    totalRuns === 0 ? 0 : Math.round((successfulRuns / totalRuns) * 100);

  const score = Math.max(0, Math.min(100, successRate - failedRuns));

  await params.supabase
    .from("agents")
    .update({
      skill_score: score,
    })
    .eq("id", params.agentId)
    .eq("company_id", params.companyId);

  return {
    totalRuns,
    successfulRuns,
    failedRuns,
    successRate,
    score,
  };
}
