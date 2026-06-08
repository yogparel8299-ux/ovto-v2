import type { SupabaseClient } from "@supabase/supabase-js";

type RunComplianceChecksParams = {
  supabase: SupabaseClient;
  companyId: string;
};

export async function runComplianceChecks(
  params: RunComplianceChecksParams
) {
  const { supabase, companyId } = params;

  const checks = [];

  const { data: agents, error: agentsError } =
    await supabase
      .from("agents")
      .select("id,name,permissions,connected_apps")
      .eq("company_id", companyId);

  if (agentsError) {
    throw new Error(agentsError.message);
  }

  const agentList = agents || [];

  const excessivePermissions =
    agentList.filter((agent) => {
      const permissions = agent.permissions || [];
      return Array.isArray(permissions)
        ? permissions.length > 10
        : false;
    });

  const complianceResult1 =
    await supabase
      .from("compliance_checks")
      .insert({
        company_id: companyId,
        check_type: "permission_audit",
        status:
          excessivePermissions.length > 0
            ? "warning"
            : "passed",
        findings: excessivePermissions,
      })
      .select()
      .single();

  if (complianceResult1.error) {
    throw new Error(complianceResult1.error.message);
  }

  checks.push(complianceResult1.data);

  const disconnectedApps =
    agentList.filter((agent) => {
      const apps = agent.connected_apps || [];
      return !Array.isArray(apps) || apps.length === 0;
    });

  const complianceResult2 =
    await supabase
      .from("compliance_checks")
      .insert({
        company_id: companyId,
        check_type: "integration_audit",
        status:
          disconnectedApps.length > 0
            ? "warning"
            : "passed",
        findings: disconnectedApps,
      })
      .select()
      .single();

  if (complianceResult2.error) {
    throw new Error(complianceResult2.error.message);
  }

  checks.push(complianceResult2.data);

  return {
    total_checks: checks.length,
    checks,
  };
}
