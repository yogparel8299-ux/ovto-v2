import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCompanyAnalytics(params: {
  supabase: SupabaseClient;
  companyId: string;
}) {
  const [
    agentRuns,
    workflowRuns,
    teamRuns,
    usage,
    approvals,
  ] = await Promise.all([
    params.supabase.from("agent_runs").select("*").eq("company_id", params.companyId),
    params.supabase.from("workflow_runs").select("*").eq("company_id", params.companyId),
    params.supabase.from("team_runs").select("*").eq("company_id", params.companyId),
    params.supabase.from("usage_metering").select("*").eq("company_id", params.companyId),
    params.supabase.from("approvals").select("*").eq("company_id", params.companyId),
  ]);

  const runs = agentRuns.data || [];
  const workflows = workflowRuns.data || [];
  const teams = teamRuns.data || [];
  const usageRows = usage.data || [];
  const approvalRows = approvals.data || [];

  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const failedRuns = runs.filter((r) => r.status === "failed").length;
  const runningRuns = runs.filter((r) => r.status === "running").length;
  const queuedRuns = runs.filter((r) => r.status === "queued").length;

  const totalCostCents = usageRows.reduce(
    (sum, row) => sum + Number(row.cost_cents || 0),
    0
  );

  const totalUnits = usageRows.reduce(
    (sum, row) => sum + Number(row.units_used || 0),
    0
  );

  return {
    agent_runs: {
      total: runs.length,
      completed: completedRuns,
      failed: failedRuns,
      running: runningRuns,
      queued: queuedRuns,
      success_rate:
        runs.length > 0 ? Math.round((completedRuns / runs.length) * 100) : 0,
    },
    workflows: {
      total: workflows.length,
      completed: workflows.filter((r) => r.status === "completed").length,
      running: workflows.filter((r) => r.status === "running").length,
      failed: workflows.filter((r) => r.status === "failed").length,
    },
    swarms: {
      total: teams.length,
      completed: teams.filter((r) => r.status === "completed").length,
      running: teams.filter((r) => r.status === "running").length,
      failed: teams.filter((r) => r.status === "failed").length,
    },
    approvals: {
      total: approvalRows.length,
      pending: approvalRows.filter((r) => r.status === "pending").length,
      approved: approvalRows.filter((r) => r.status === "approved").length,
      rejected: approvalRows.filter((r) => r.status === "rejected").length,
    },
    usage: {
      total_units: totalUnits,
      total_cost_cents: totalCostCents,
    },
    generated_at: new Date().toISOString(),
  };
}

export async function getAgentAnalytics(params: {
  supabase: SupabaseClient;
  companyId: string;
  agentId?: string;
}) {
  let query = params.supabase
    .from("agent_runs")
    .select("*")
    .eq("company_id", params.companyId);

  if (params.agentId) {
    query = query.eq("agent_id", params.agentId);
  }

  const { data: runs, error } = await query;

  if (error) throw new Error(error.message);

  const grouped: Record<string, any> = {};

  for (const run of runs || []) {
    const id = run.agent_id;

    if (!grouped[id]) {
      grouped[id] = {
        agent_id: id,
        total_runs: 0,
        completed_runs: 0,
        failed_runs: 0,
        running_runs: 0,
        queued_runs: 0,
        total_tokens: 0,
        total_cost_cents: 0,
      };
    }

    grouped[id].total_runs += 1;
    if (run.status === "completed") grouped[id].completed_runs += 1;
    if (run.status === "failed") grouped[id].failed_runs += 1;
    if (run.status === "running") grouped[id].running_runs += 1;
    if (run.status === "queued") grouped[id].queued_runs += 1;

    grouped[id].total_tokens += Number(run.total_tokens || 0);
    grouped[id].total_cost_cents += Number(run.cost_cents || 0);
  }

  return Object.values(grouped).map((item: any) => ({
    ...item,
    success_rate:
      item.total_runs > 0
        ? Math.round((item.completed_runs / item.total_runs) * 100)
        : 0,
  }));
}
