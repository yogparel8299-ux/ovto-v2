import { getSupabase } from "./client";

export type TeamWorkerItem = {
  name: string;
  role: string;
  responsibilities: string;
};

export type TeamRecord = {
  id: string;
  name: string;
  description: string;
  workers: TeamWorkerItem[];
  apps: string[];
  files: string[];
  status: "Working" | "Waiting" | "Finished" | "Needs Approval";
  approvalRule: string;
  currentWork: string;
  tasks: string[];
};

function mapTeamStatus(
  status: string | null
): TeamRecord["status"] {
  const s = (status ?? "Waiting").toLowerCase();
  if (s === "working" || s === "running") return "Working";
  if (s === "finished" || s === "completed") return "Finished";
  if (s === "needs approval" || s === "pending") return "Needs Approval";
  return "Waiting";
}

export function mapTeamRow(row: Record<string, unknown>): TeamRecord {
  return {
    id: String(row.id),
    name: String(row.name ?? "Team"),
    description: String(row.description ?? ""),
    workers: Array.isArray(row.workers)
      ? (row.workers as TeamWorkerItem[])
      : [],
    apps: Array.isArray(row.apps) ? (row.apps as string[]) : [],
    files: Array.isArray(row.files) ? (row.files as string[]) : [],
    status: mapTeamStatus(row.status as string | null),
    approvalRule: String(row.approval_rule ?? ""),
    currentWork: String(row.current_work ?? ""),
    tasks: Array.isArray(row.tasks) ? (row.tasks as string[]) : [],
  };
}

export async function fetchTeams(companyId: string): Promise<TeamRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("teams")
    .select(
      "id, name, description, status, workers, apps, files, approval_rule, current_work, tasks"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapTeamRow(row));
}
