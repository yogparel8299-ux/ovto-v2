import type { SupabaseClient } from "@supabase/supabase-js";

export async function calculateAgentHealth(params:{
  supabase:SupabaseClient;
  companyId:string;
  agentId:string;
}) {
  const { data, error } = await params.supabase
    .from("agent_failures")
    .select("*")
    .eq("company_id", params.companyId)
    .eq("agent_id", params.agentId);

  if (error) throw new Error(error.message);

  const failures = data || [];

  const health =
    Math.max(
      0,
      100 - failures.length * 5
    );

  await params.supabase
    .from("agents")
    .update({
      failure_count: failures.length
    })
    .eq("id", params.agentId)
    .eq("company_id", params.companyId);

  return {
    health,
    failures: failures.length
  };
}
