import type { AIWorker } from "@/types";
import { getSupabase } from "./client";

const AVATAR_COLORS = [
  "bg-stone-100 text-stone-900 border-stone-200",
  "bg-[#FCFCFB] text-stone-900 border-stone-200",
  "bg-stone-50 text-stone-600 border-stone-100",
];

function mapStatus(
  status: string | null
): AIWorker["status"] {
  const normalized = (status ?? "idle").toLowerCase();
  if (
    normalized === "running" ||
    normalized === "completed" ||
    normalized === "paused" ||
    normalized === "idle"
  ) {
    return normalized;
  }
  return "idle";
}

function mapRole(role: string | null): AIWorker["role"] {
  const valid: AIWorker["role"][] = [
    "Finance",
    "Operations",
    "Support",
    "Research",
    "Marketing",
    "Legal",
  ];
  const match = valid.find(
    (r) => r.toLowerCase() === (role ?? "").toLowerCase()
  );
  return match ?? "Support";
}

export function mapAgentRow(
  row: Record<string, unknown>,
  index: number
): AIWorker {
  const connectedApps = row.connected_apps;
  return {
    id: String(row.id),
    name: String(row.name ?? "Agent"),
    role: mapRole(row.role as string | null),
    status: mapStatus(row.status as string | null),
    avatarColor:
      (row.avatar_color as string) ||
      AVATAR_COLORS[index % AVATAR_COLORS.length],
    connectedApps: Array.isArray(connectedApps)
      ? (connectedApps as string[])
      : [],
    tasksCount: Number(row.tasks_count ?? 0),
  };
}

export async function fetchAgents(companyId: string): Promise<AIWorker[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("agents")
    .select(
      "id, name, role, status, avatar_color, connected_apps, tasks_count"
    )
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row, index) => mapAgentRow(row, index));
}

export async function fetchConnectedAppNames(
  companyId: string
): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("integrations")
    .select("name")
    .eq("company_id", companyId)
    .eq("connected", true);

  if (error || !data) return [];
  return data.map((row) => row.name);
}
