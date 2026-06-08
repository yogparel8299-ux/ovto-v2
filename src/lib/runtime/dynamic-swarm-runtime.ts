import type { SupabaseClient } from "@supabase/supabase-js";

export async function optimizeSwarm(params:{
  supabase:SupabaseClient;
  companyId:string;
  teamId:string;
}){

  const { data,error } = await params.supabase
    .from("agents")
    .select("*")
    .eq("company_id",params.companyId)
    .eq("status","active")
    .order("skill_score",{ ascending:false });

  if(error){
    throw new Error(error.message);
  }

  const agents = data || [];

  const bestLeader =
    [...agents]
      .sort(
        (a,b)=>
          Number(b.skill_score || 0) -
          Number(a.skill_score || 0)
      )[0] || null;

  const chain = agents
    .slice(0,10)
    .map(agent=>({
      agent_id:agent.id,
      name:agent.name,
      role:agent.role,
      skill_score:Number(agent.skill_score || 0),
      roi_score:Number(agent.roi_score || 0)
    }));

  await params.supabase
    .from("teams")
    .update({
      leadership_agent_id:bestLeader?.id || null,
      chain_of_command:chain,
      updated_at:new Date().toISOString()
    })
    .eq("id",params.teamId)
    .eq("company_id",params.companyId);

  return {
    leader:bestLeader,
    chain
  };
}
