import type { SupabaseClient } from "@supabase/supabase-js";

export async function runProductionChecks(params:{
  supabase:SupabaseClient;
  companyId:string;
}){

  const checks = [];

  const { data:agents } =
    await params.supabase
      .from("agents")
      .select("id,status");

  checks.push({
    check:"agents_exist",
    passed:(agents || []).length > 0
  });

  const { data:workflows } =
    await params.supabase
      .from("workflows")
      .select("id,status");

  checks.push({
    check:"workflows_exist",
    passed:(workflows || []).length > 0
  });

  const { data:workers } =
    await params.supabase
      .from("worker_heartbeats")
      .select("id");

  checks.push({
    check:"workers_registered",
    passed:(workers || []).length > 0
  });

  const passed =
    checks.every(
      check => check.passed
    );

  return {
    production_ready: passed,
    checks
  };
}
