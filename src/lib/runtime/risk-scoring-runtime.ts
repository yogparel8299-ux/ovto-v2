import type { SupabaseClient } from "@supabase/supabase-js";

type CalculateRiskScoreParams = {
  supabase: SupabaseClient;
  companyId: string;
};

export async function calculateRiskScore(
  params: CalculateRiskScoreParams
) {
  const { supabase, companyId } = params;

  const { data: agents, error: agentsError } = await supabase
    .from("agents")
    .select("failure_count");

  if (agentsError) {
    throw new Error(agentsError.message);
  }

  const { data: runs, error: runsError } = await supabase
    .from("agent_runs")
    .select("status")
    .eq("company_id", companyId);

  if (runsError) {
    throw new Error(runsError.message);
  }

  const agentList = agents || [];
  const runList = runs || [];

  const totalFailures = agentList.reduce(
    (sum, agent) => sum + Number(agent.failure_count || 0),
    0
  );

  const failedRuns = runList.filter(
    (run) => run.status === "failed"
  ).length;

  const totalRuns = runList.length;

  const failureRate =
    totalRuns > 0
      ? (failedRuns / totalRuns) * 100
      : 0;

  const riskScore = Math.min(
    100,
    Math.round(
      totalFailures * 2 +
      failureRate
    )
  );

  let riskLevel = "low";

  if (riskScore >= 70) {
    riskLevel = "critical";
  } else if (riskScore >= 40) {
    riskLevel = "high";
  } else if (riskScore >= 20) {
    riskLevel = "medium";
  }

  const { data: assessment, error: assessmentError } =
    await supabase
      .from("risk_assessments")
      .insert({
        company_id: companyId,
        risk_score: riskScore,
        risk_level: riskLevel,
        factors: {
          total_failures: totalFailures,
          failed_runs: failedRuns,
          total_runs: totalRuns,
          failure_rate: failureRate,
        },
      })
      .select()
      .single();

  if (assessmentError) {
    throw new Error(assessmentError.message);
  }

  return assessment;
}
