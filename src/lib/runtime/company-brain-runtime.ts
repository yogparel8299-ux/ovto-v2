import type { SupabaseClient } from "@supabase/supabase-js";

export async function saveCompanyMemory(params:{
  supabase:SupabaseClient;
  companyId:string;
  createdBy:string;
  title:string;
  content:string;
  memoryType:string;
  importanceScore?:number;
  confidenceScore?:number;
}){

  const summary =
    params.content.length > 500
      ? params.content.slice(0,500)
      : params.content;

  const { data,error } = await params.supabase
    .from("company_brain_memories")
    .insert({
      company_id: params.companyId,
      created_by: params.createdBy,
      memory_type: params.memoryType,
      title: params.title,
      content: params.content,
      summary,
      importance_score: params.importanceScore || 50,
      confidence_score: params.confidenceScore || 100
    })
    .select()
    .single();

  if(error) throw new Error(error.message);

  return data;
}

export async function searchCompanyBrain(params:{
  supabase:SupabaseClient;
  companyId:string;
  query:string;
}){

  const { data,error } = await params.supabase
    .from("company_brain_memories")
    .select("*")
    .eq("company_id",params.companyId)
    .or(`title.ilike.%${params.query}%,content.ilike.%${params.query}%`)
    .order("importance_score",{ascending:false})
    .limit(50);

  if(error) throw new Error(error.message);

  return data || [];
}
