import type { SupabaseClient } from "@supabase/supabase-js";

export async function createKnowledgeNode(params:{
  supabase: SupabaseClient;
  companyId:string;
  nodeType:string;
  title:string;
  description?:string;
  sourceTable?:string;
  sourceId?:string;
  metadata?:Record<string,unknown>;
}){

  const { data,error } = await params.supabase
    .from("knowledge_nodes")
    .insert({
      company_id: params.companyId,
      node_type: params.nodeType,
      title: params.title,
      description: params.description || "",
      source_table: params.sourceTable || null,
      source_id: params.sourceId || null,
      metadata: params.metadata || {}
    })
    .select()
    .single();

  if(error) throw new Error(error.message);

  return data;
}

export async function createKnowledgeEdge(params:{
  supabase: SupabaseClient;
  companyId:string;
  sourceNodeId:string;
  targetNodeId:string;
  relationshipType:string;
  weight?:number;
  metadata?:Record<string,unknown>;
}){

  const { data,error } = await params.supabase
    .from("knowledge_edges")
    .insert({
      company_id: params.companyId,
      source_node_id: params.sourceNodeId,
      target_node_id: params.targetNodeId,
      relationship_type: params.relationshipType,
      weight: params.weight || 1,
      metadata: params.metadata || {}
    })
    .select()
    .single();

  if(error) throw new Error(error.message);

  return data;
}
