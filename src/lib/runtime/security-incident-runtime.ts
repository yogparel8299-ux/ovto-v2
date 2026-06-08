import type { SupabaseClient } from "@supabase/supabase-js";

type DetectSecurityIncidentsParams = {
  supabase: SupabaseClient;
  companyId: string;
};

export async function detectSecurityIncidents(
  params: DetectSecurityIncidentsParams
) {
  const { supabase, companyId } = params;

  const { data: failedRuns, error } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("company_id", companyId)
    .eq("status", "failed");

  if (error) {
    throw new Error(error.message);
  }

  const runs = failedRuns || [];
  const incidents = [];

  for (const run of runs) {
    const errorMessage = String(run.error_message || "").toLowerCase();

    let title = "Agent Execution Failure";
    let description =
      `Agent ${run.agent_id} failed during execution.`;
    let severity = "low";

    if (
      errorMessage.includes("unauthorized") ||
      errorMessage.includes("forbidden") ||
      errorMessage.includes("permission")
    ) {
      title = "Unauthorized Access Attempt";
      description =
        `Agent ${run.agent_id} encountered an authorization failure.`;
      severity = "high";
    } else if (
      errorMessage.includes("token") ||
      errorMessage.includes("secret") ||
      errorMessage.includes("credential")
    ) {
      title = "Credential Exposure Risk";
      description =
        `Agent ${run.agent_id} produced a credential-related error.`;
      severity = "critical";
    } else if (
      errorMessage.includes("rate limit") ||
      errorMessage.includes("timeout")
    ) {
      title = "External Dependency Instability";
      description =
        `Agent ${run.agent_id} encountered an infrastructure issue.`;
      severity = "medium";
    }

    const { data: incident, error: incidentError } = await supabase
      .from("security_incidents")
      .insert({
        company_id: companyId,
        title,
        description,
        severity,
        status: "open",
        assigned_to: null,
      })
      .select()
      .single();

    if (incidentError) {
      throw new Error(incidentError.message);
    }

    incidents.push(incident);
  }

  return {
    incidents_detected: incidents.length,
    incidents,
  };
}
