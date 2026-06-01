import { getSupabase } from "./client";
import { formatTimeAgo } from "./dashboard";

export type WorkflowRecord = {
  id: string;
  name: string;
  description: string;
  workers: string[];
  apps: string[];
  status: "Running" | "Waiting" | "Finished" | "Needs Approval";
  humanWording: string;
  lastActivity: string;
  timeAgo: string;
  filesCount: number;
  approvalRule: string;
};

function mapWorkflowStatus(
  status: string | null
): WorkflowRecord["status"] {
  const s = (status ?? "waiting").toLowerCase();
  if (s === "running") return "Running";
  if (s === "finished" || s === "completed") return "Finished";
  if (s === "needs approval" || s === "pending") return "Needs Approval";
  return "Waiting";
}

export function mapWorkflowRow(row: Record<string, unknown>): WorkflowRecord {
  const workers = row.workers;
  const apps = row.apps;
  return {
    id: String(row.id),
    name: String(row.name ?? "Workflow"),
    description: String(row.description ?? ""),
    workers: Array.isArray(workers) ? (workers as string[]) : [],
    apps: Array.isArray(apps) ? (apps as string[]) : [],
    status: mapWorkflowStatus(row.status as string | null),
    humanWording: String(row.human_wording ?? ""),
    lastActivity: String(row.last_activity ?? ""),
    timeAgo: row.updated_at
      ? formatTimeAgo(String(row.updated_at))
      : row.created_at
        ? formatTimeAgo(String(row.created_at))
        : "",
    filesCount: Number(row.files_count ?? 0),
    approvalRule: String(row.approval_rule ?? ""),
  };
}

export async function fetchWorkflows(
  companyId: string
): Promise<WorkflowRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("workflows")
    .select(
      "id, name, description, workers, apps, status, human_wording, last_activity, approval_rule, files_count, created_at, updated_at"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapWorkflowRow(row));
}
