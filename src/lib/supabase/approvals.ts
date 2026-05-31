import { getSupabase } from "./client";
import { formatTimeAgo } from "./dashboard";

export type ApprovalRecord = {
  id: string;
  title: string;
  workerName: string;
  appName: string;
  timeRequested: string;
  type: "email" | "refund" | "social_post" | "inventory" | "payment";
  status: "pending" | "approved" | "rejected";
  description: string;
  previewContent: string;
  icon: string;
};

const TYPE_ICONS: Record<ApprovalRecord["type"], string> = {
  email: "✉️",
  refund: "💳",
  social_post: "🌍",
  inventory: "📦",
  payment: "📈",
};

function mapApprovalType(value: string | null): ApprovalRecord["type"] {
  const normalized = (value ?? "email").toLowerCase();
  if (
    normalized === "refund" ||
    normalized === "social_post" ||
    normalized === "inventory" ||
    normalized === "payment"
  ) {
    return normalized;
  }
  return "email";
}

export function mapApprovalRow(row: Record<string, unknown>): ApprovalRecord {
  const type = mapApprovalType(row.type as string | null);
  return {
    id: String(row.id),
    title: String(row.title ?? "Approval required"),
    workerName: String(row.worker_name ?? "System"),
    appName: String(row.app_name ?? "Workspace"),
    timeRequested: formatTimeAgo(
      String(row.created_at ?? new Date().toISOString())
    ),
    type,
    status: (row.status as ApprovalRecord["status"]) ?? "pending",
    description: String(row.description ?? ""),
    previewContent: String(row.preview_content ?? ""),
    icon: TYPE_ICONS[type],
  };
}

export async function fetchApprovals(
  companyId: string
): Promise<ApprovalRecord[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("approvals")
    .select(
      "id, title, worker_name, app_name, type, status, description, preview_content, created_at"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapApprovalRow(row));
}

export async function updateApprovalStatus(
  companyId: string,
  approvalId: string,
  status: "approved" | "rejected"
): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("approvals")
    .update({ status })
    .eq("company_id", companyId)
    .eq("id", approvalId);
}
