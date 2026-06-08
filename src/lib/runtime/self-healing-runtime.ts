import type { SupabaseClient } from "@supabase/supabase-js";

export async function healSwarm(params:{
  supabase:SupabaseClient;
  companyId:string;
}){

  const { data, error } =
    await params.supabase
      .from("agent_runs")
      .select("*")
      .eq("company_id", params.companyId)
      .eq("status", "failed");

  if(error){
    throw new Error(error.message);
  }

  const failed = data || [];

  const healed = [];

  for(const run of failed){

    const {
      data: replacement,
      error: replacementError
    } =
      await params.supabase
        .from("agents")
        .select("*")
        .eq("company_id", params.companyId)
        .eq("status", "active")
        .neq("id", run.agent_id)
        .order("skill_score", { ascending:false })
        .limit(1)
        .maybeSingle();

    if(replacementError){
      throw new Error(replacementError.message);
    }

    if(!replacement){
      continue;
    }

    const {
      data: queuedRun,
      error: queueError
    } =
      await params.supabase
        .from("agent_runs")
        .insert({
          company_id: params.companyId,
          agent_id: replacement.id,
          task_id: run.task_id,
          status: "queued",
          trigger_source: "self_healing_swarm",
          trigger_payload: {
            original_run_id: run.id
          },
          input: run.input
        })
        .select()
        .single();

    if(queueError){
      throw new Error(queueError.message);
    }

    healed.push({
      failed_run_id: run.id,
      replacement_agent_id: replacement.id,
      queued_run_id: queuedRun.id
    });
  }

  return healed;
}
