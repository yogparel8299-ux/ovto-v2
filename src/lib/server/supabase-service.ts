import { createClient } from "@supabase/supabase-js";

export function getServiceSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export function getUserSupabase(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");

  const authorization = request.headers.get("authorization") ?? "";

  return createClient(url, key, {
    global: {
      headers: authorization
        ? {
            Authorization: authorization,
          }
        : {},
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export async function requireUserAndCompany(request: Request, companyId: string) {
  const userClient = getUserSupabase(request);
  const service = getServiceSupabase();

  const { data: userData, error: userError } = await userClient.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Unauthorized");
  }

  const userId = userData.user.id;

  const { data: member } = await service
    .from("company_members")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!member) {
    const { data: profile } = await service
      .from("profiles")
      .select("default_company_id")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.default_company_id !== companyId) {
      throw new Error("Forbidden");
    }
  }

  return {
    userId,
    service,
  };
}
