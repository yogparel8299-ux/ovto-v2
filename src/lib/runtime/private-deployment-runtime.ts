import type { SupabaseClient } from "@supabase/supabase-js";

export async function configurePrivateDeployment(params:{
  supabase:SupabaseClient;
  companyId:string;
  deploymentType:string;
  environment:string;
  configuration:Record<string,unknown>;
}){

  const { data, error } =
    await params.supabase
      .from("deployment_configs")
      .upsert({
        company_id: params.companyId,
        deployment_type: params.deploymentType,
        environment: params.environment,
        configuration: params.configuration,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

  if(error){
    throw new Error(error.message);
  }

  return data;
}
