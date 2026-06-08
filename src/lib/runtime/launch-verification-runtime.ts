import type { SupabaseClient } from "@supabase/supabase-js";

export async function verifyLaunch(params:{
  supabase:SupabaseClient;
  companyId:string;
}){

  const verification = {
    billing:false,
    workers:false,
    agents:false,
    workflows:false
  };

  const { data:billing } =
    await params.supabase
      .from("subscriptions")
      .select("id")
      .eq("company_id",params.companyId);

  verification.billing =
    (billing || []).length > 0;

  const { data:agents } =
    await params.supabase
      .from("agents")
      .select("id")
      .eq("company_id",params.companyId);

  verification.agents =
    (agents || []).length > 0;

  const { data:workflows } =
    await params.supabase
      .from("workflows")
      .select("id")
      .eq("company_id",params.companyId);

  verification.workflows =
    (workflows || []).length > 0;

  const { data:workers } =
    await params.supabase
      .from("worker_heartbeats")
      .select("id");

  verification.workers =
    (workers || []).length > 0;

  return {
    ready:
      Object.values(
        verification
      ).every(Boolean),
    verification
  };
}
