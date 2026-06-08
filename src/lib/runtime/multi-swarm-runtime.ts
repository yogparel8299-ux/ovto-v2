import type { SupabaseClient } from "@supabase/supabase-js";

export async function coordinateSwarms(params:{
  supabase:SupabaseClient;
  companyId:string;
  objective:string;
}){

  const { data,error } =
    await params.supabase
      .from("teams")
      .select("*")
      .eq("company_id",params.companyId)
      .eq("status","active");

  if(error){
    throw new Error(error.message);
  }

  const teams = data || [];

  const created = [];

  for(const team of teams){

    created.push({
      team_id:team.id,
      leader:team.leadership_agent_id,
      objective:params.objective
    });
  }

  return created;
}
