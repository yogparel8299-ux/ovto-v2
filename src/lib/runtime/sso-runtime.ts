import type { SupabaseClient } from "@supabase/supabase-js";

type ValidateSSOLoginParams = {
  supabase: SupabaseClient;
  companyId: string;
  email: string;
  provider: string;
};

export async function validateSSOLogin(
  params: ValidateSSOLoginParams
) {
  const { supabase, companyId, email, provider } = params;

  const { data: company, error } =
    await supabase
      .from("companies")
      .select("id,metadata")
      .eq("id", companyId)
      .single();

  if (error) {
    throw new Error(error.message);
  }

  const metadata = company?.metadata || {};

  const enabledProviders =
    metadata.sso_providers || [];

  const allowed =
    Array.isArray(enabledProviders)
      ? enabledProviders.includes(provider)
      : false;

  return {
    authenticated: allowed,
    provider,
    email,
    company_id: companyId,
  };
}
