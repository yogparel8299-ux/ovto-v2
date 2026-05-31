import { supabase } from "./client";

export async function ensureDefaultCompany(email?: string) {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_company_id")
    .eq("id", user.id)
    .single();

  if (profile?.default_company_id) {
    return profile.default_company_id;
  }

  const companyName =
    email?.split("@")[0]?.replace(/[^a-zA-Z0-9 ]/g, " ") || "My Company";

  const { data, error } = await supabase.rpc("create_company", {
    company_name: companyName,
    company_slug: `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
  });

  if (error) {
    console.error("Company creation failed:", error);
    return null;
  }

  return data;
}
