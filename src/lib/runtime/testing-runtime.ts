import type { SupabaseClient } from "@supabase/supabase-js";

export async function runSystemTests(params:{
  supabase:SupabaseClient;
  companyId:string;
}){

  const results = [];

  const tests = [
    {
      name:"agents",
      table:"agents"
    },
    {
      name:"workflows",
      table:"workflows"
    },
    {
      name:"teams",
      table:"teams"
    },
    {
      name:"agent_runs",
      table:"agent_runs"
    },
    {
      name:"subscriptions",
      table:"subscriptions"
    }
  ];

  for(const test of tests){

    const { data, error } =
      await params.supabase
        .from(test.table)
        .select("id")
        .limit(1);

    results.push({
      test:test.name,
      passed:!error,
      details:error?.message || "OK"
    });
  }

  const passedCount =
    results.filter(
      r => r.passed
    ).length;

  const failedCount =
    results.length - passedCount;

  const status =
    failedCount === 0
      ? "passed"
      : "failed";

  const { data:testRun, error } =
    await params.supabase
      .from("test_runs")
      .insert({
        company_id:params.companyId,
        test_suite:"system",
        status,
        passed_count:passedCount,
        failed_count:failedCount,
        results
      })
      .select()
      .single();

  if(error){
    throw new Error(error.message);
  }

  return testRun;
}
