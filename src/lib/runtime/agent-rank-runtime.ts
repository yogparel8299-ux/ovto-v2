import type { SupabaseClient } from "@supabase/supabase-js";

export async function promoteAgent(params:{
  supabase:SupabaseClient;
  companyId:string;
  agentId:string;
}){

  const { data:agent } = await params.supabase
    .from("agents")
    .select("*")
    .eq("id",params.agentId)
    .single();

  if(!agent) throw new Error("Agent not found");

  const metadata = {
    ...(agent.metadata || {}),
    promoted_at:new Date().toISOString(),
    promoted:true
  };

  await params.supabase
    .from("agents")
    .update({ metadata })
    .eq("id",params.agentId);

  return metadata;
}

export async function demoteAgent(params:{
  supabase:SupabaseClient;
  companyId:string;
  agentId:string;
}){

  const { data:agent } = await params.supabase
    .from("agents")
    .select("*")
    .eq("id",params.agentId)
    .single();

  if(!agent) throw new Error("Agent not found");

  const metadata = {
    ...(agent.metadata || {}),
    demoted_at:new Date().toISOString(),
    demoted:true
  };

  await params.supabase
    .from("agents")
    .update({ metadata })
    .eq("id",params.agentId);

  return metadata;
}
