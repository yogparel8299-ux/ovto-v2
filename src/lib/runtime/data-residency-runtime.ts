import type { SupabaseClient } from "@supabase/supabase-js";

export async function configureDataResidency(params:{
  supabase:SupabaseClient;
  companyId:string;
  region:string;
}){

  const { data, error } =
    await params.supabase
      .from("data_residency_configs")
      .upsert({
        company_id: params.companyId,
        region: params.region,
        storage_region: params.region,
        processing_region: params.region,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

  if(error){
    throw new Error(error.message);
  }

  return data;
}
