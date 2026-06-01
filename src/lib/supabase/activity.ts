import { getSupabase } from "./client";
import { formatTimeAgo } from "./dashboard";

export type ActivityLogEntry = {
  id: string;
  worker: string;
  text: string;
  time: string;
  type?: string;
  workflow?: string;
  dept?: string;
};

export async function fetchActivityLogs(
  companyId: string,
  limit = 20
): Promise<ActivityLogEntry[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("activity_feed")
    .select("id, message, worker_name, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    worker: row.worker_name ?? "System",
    text: row.message,
    time: formatTimeAgo(row.created_at),
    type: "Activity",
  }));
}
