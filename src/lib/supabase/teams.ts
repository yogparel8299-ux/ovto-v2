import { getSupabase } from "./client";

export type TeamRecord = {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
};

export async function fetchTeams(companyId: string): Promise<TeamRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, description, status")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    status: row.status,
  }));
}

export async function countTeams(companyId: string): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true })
    .eq("company_id", companyId);
  if (error) return 0;
  return count ?? 0;
}
