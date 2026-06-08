import type { SupabaseClient } from "@supabase/supabase-js";

export async function createDelegation(params:{
  supabase:SupabaseClient;
  companyId:string;
  fromAgentId:string;
  toAgentId:string;
  task:string;
  context?:Record<string,unknown>;
}){

  const { data,error } = await params.supabase
    .from("agent_delegations")
    .insert({
      company_id: params.companyId,
      from_agent_id: params.fromAgentId,
      to_agent_id: params.toAgentId,
      task: params.task,
      context: params.context || {},
      status: "pending"
    })
    .select()
    .single();

  if(error) throw new Error(error.message);

  return data;
}
