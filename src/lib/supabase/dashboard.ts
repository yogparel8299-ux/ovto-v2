import { getSupabase } from "./client";
import type { AIWorker, MockFile } from "@/types";

export type WorkspaceContext = {
  userId: string;
  email: string;
  companyId: string | null;
};

export type DashboardMetrics = {
  agents: number;
  teams: number;
  workflows: number;
  approvals: number;
  datasets: number;
  marketplaceItems: number;
};

export type DashboardActivity = {
  id: string;
  text: string;
  time: string;
  worker: string;
};

export type DashboardApproval = {
  id: string;
  worker: string;
  title: string;
  description: string;
  actionLabel: string;
};

export type CompanyOption = {
  id: string;
  name: string;
};

export type ConnectedApp = {
  name: string;
  connected: boolean;
  desc: string;
};

export type DashboardInitialData = {
  metrics: DashboardMetrics;
  activities: DashboardActivity[];
  approvals: DashboardApproval[];
  notifications: string[];
  companies: CompanyOption[];
  apps: ConnectedApp[];
  workers: AIWorker[];
  files: MockFile[];
};

export function formatTimeAgo(isoDate: string): string {
  const date = new Date(isoDate);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return days === 1 ? "Yesterday" : `${days} days ago`;
  return date.toLocaleDateString();
}

export async function getWorkspaceContext(): Promise<WorkspaceContext | null> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, default_company_id")
    .eq("id", user.id)
    .single();

  return {
    userId: user.id,
    email: profile?.email ?? user.email ?? "",
    companyId: profile?.default_company_id ?? null,
  };
}

export async function insertActivity(
  companyId: string,
  message: string,
  workerName: string
): Promise<void> {
  const supabase = getSupabase();
  await supabase.from("activity_feed").insert({
    company_id: companyId,
    message,
    worker_name: workerName,
  });
}

export async function fetchDashboardMetrics(
  companyId: string
): Promise<DashboardMetrics> {
  const supabase = getSupabase();
  const tables = [
    { key: "agents" as const, table: "agents" },
    { key: "teams" as const, table: "teams" },
    { key: "workflows" as const, table: "workflows" },
    { key: "approvals" as const, table: "approvals" },
    { key: "datasets" as const, table: "datasets" },
    { key: "marketplaceItems" as const, table: "marketplace_items" },
  ];

  const counts = await Promise.all(
    tables.map(async ({ key, table }) => {
      const { count, error } = await supabase
        .from(table)
        .select("*", { count: "exact", head: true })
        .eq("company_id", companyId);
      if (error) return { key, count: 0 };
      return { key, count: count ?? 0 };
    })
  );

  const result: DashboardMetrics = {
    agents: 0,
    teams: 0,
    workflows: 0,
    approvals: 0,
    datasets: 0,
    marketplaceItems: 0,
  };
  for (const { key, count } of counts) {
    result[key] = count;
  }
  return result;
}

export async function fetchRecentActivity(
  companyId: string,
  limit = 10
): Promise<DashboardActivity[]> {
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
    text: row.message,
    worker: row.worker_name ?? "System",
    time: formatTimeAgo(row.created_at),
  }));
}

export async function fetchDashboardApprovals(
  companyId: string,
  limit = 5
): Promise<DashboardApproval[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("approvals")
    .select("id, worker_name, title, description, action_label")
    .eq("company_id", companyId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    worker: row.worker_name ?? "System",
    title: row.title,
    description: row.description ?? "",
    actionLabel: row.action_label ?? "Approve",
  }));
}

export async function fetchNotifications(
  companyId: string,
  limit = 10
): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("notifications")
    .select("message")
    .eq("company_id", companyId)
    .eq("read", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => row.message);
}

export async function clearNotifications(companyId: string): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("company_id", companyId)
    .eq("read", false);
}

export async function fetchUserCompanies(
  userId: string
): Promise<CompanyOption[]> {
  const supabase = getSupabase();
  const { data: memberships, error } = await supabase
    .from("company_members")
    .select("company_id, companies(id, name)")
    .eq("user_id", userId);

  if (!error && memberships?.length) {
    return memberships
      .map((row) => {
        const company = Array.isArray(row.companies) ? row.companies[0] : row.companies as { id: string; name: string } | null;
        if (!company) return null;
        return { id: company.id, name: company.name };
      })
      .filter((c): c is CompanyOption => c !== null);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("default_company_id")
    .eq("id", userId)
    .single();

  if (!profile?.default_company_id) return [];

  const { data: company } = await supabase
    .from("companies")
    .select("id, name")
    .eq("id", profile.default_company_id)
    .single();

  if (!company) return [];
  return [{ id: company.id, name: company.name }];
}

export async function fetchConnectedApps(
  companyId: string
): Promise<ConnectedApp[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("integrations")
    .select("name, connected, description")
    .eq("company_id", companyId)
    .order("name");

  if (error || !data) return [];
  return data.map((row) => ({
    name: row.name,
    connected: row.connected ?? false,
    desc: row.description ?? "",
  }));
}

export async function updateIntegrationConnection(
  companyId: string,
  appName: string,
  connected: boolean
): Promise<void> {
  const supabase = getSupabase();
  await supabase
    .from("integrations")
    .update({ connected })
    .eq("company_id", companyId)
    .eq("name", appName);
}

export async function resolveApproval(
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
