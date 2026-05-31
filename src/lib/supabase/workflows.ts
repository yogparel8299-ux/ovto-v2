import { getSupabase } from "./client";

export type WorkflowRecord = {
  id: string;
  name: string;
  description: string | null;
  status: string | null;
};

export async function fetchWorkflows(
  companyId: string
): Promise<WorkflowRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workflows")
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
