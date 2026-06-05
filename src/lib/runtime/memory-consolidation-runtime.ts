import type { SupabaseClient } from "@supabase/supabase-js";

export async function consolidateMemories(params:{
  supabase:SupabaseClient;
  companyId:string;
}){

  const { data,error } = await params.supabase
    .from("company_brain_memories")
    .select("*")
    .eq("company_id",params.companyId)
    .order("importance_score",{ascending:false})
    .limit(100);

  if(error) throw new Error(error.message);

  const memories = data || [];

  const summary = memories
    .map(m => m.title)
    .join(" | ");

  const { data: consolidated } = await params.supabase
    .from("company_brain_memories")
    .insert({
      company_id: params.companyId,
      created_by: null,
      memory_type: "consolidated",
      title: "Consolidated Memory",
      content: summary,
      summary,
      importance_score: 100,
      confidence_score: 100
    })
    .select()
    .single();

  return consolidated;
}
