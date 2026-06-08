import type { SupabaseClient } from "@supabase/supabase-js";

type ProvisionUserParams = {
  supabase: SupabaseClient;
  companyId: string;
  email: string;
  role: string;
};

export async function provisionUser(
  params: ProvisionUserParams
) {
  const { supabase, companyId, email, role } = params;

  const { data, error } =
    await supabase
      .from("company_members")
      .insert({
        company_id: companyId,
        email,
        role,
      })
      .select()
      .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
