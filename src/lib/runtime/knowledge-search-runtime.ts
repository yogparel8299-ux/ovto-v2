import type { SupabaseClient } from "@supabase/supabase-js";

export async function searchKnowledgeGraph(params:{
  supabase: SupabaseClient;
  companyId:string;
  query:string;
}){

  const { data,error } = await params.supabase
    .from("knowledge_nodes")
    .select("*")
    .eq("company_id",params.companyId)
    .or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`)
    .limit(50);

  if(error) throw new Error(error.message);

  return data || [];
}

export async function getNodeRelationships(params:{
  supabase: SupabaseClient;
  companyId:string;
  nodeId:string;
}){

  const { data,error } = await params.supabase
    .from("knowledge_edges")
    .select("*")
    .eq("company_id",params.companyId)
    .or(`source_node_id.eq.${params.nodeId},target_node_id.eq.${params.nodeId}`);

  if(error) throw new Error(error.message);

  return data || [];
}
