import type { SupabaseClient } from "@supabase/supabase-js";
import { writeActivity, writeAudit } from "./run-utils";

const EXPORT_TABLES = [
  "companies",
  "agents",
  "agent_runs",
  "agent_tasks",
  "agent_memory",
  "teams",
  "team_runs",
  "team_memory",
  "team_messages",
  "workflows",
  "workflow_steps",
  "workflow_runs",
  "datasets",
  "dataset_chunks",
  "approvals",
  "activity_feed",
  "notifications",
  "usage_metering",
  "credit_wallets",
  "credit_transactions",
  "integrations",
  "tool_usage_logs",
];

export async function createWorkspaceExport(params: {
  supabase: SupabaseClient;
  companyId: string;
  requestedBy: string;
  exportType?: string;
}) {
  const { data, error } = await params.supabase
    .from("workspace_exports")
    .insert({
      company_id: params.companyId,
      requested_by: params.requestedBy,
      export_type: params.exportType || "full",
      status: "queued",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeActivity({
    supabase: params.supabase,
    companyId: params.companyId,
    type: "workspace_export.queued",
    title: "Workspace export queued",
    description: "A company workspace export was requested.",
    relatedTable: "workspace_exports",
    relatedId: data.id,
  });

  return data;
}

export async function generateWorkspaceExport(params: {
  supabase: SupabaseClient;
  exportId: string;
  companyId: string;
}) {
  const bundle: {
  company_id: string;
  exported_at: string;
  tables: Record<string, unknown[]>;
} = {
  company_id: params.companyId,
  exported_at: new Date().toISOString(),
  tables: {},
  };

  for (const table of EXPORT_TABLES) {
    const { data } = await params.supabase
      .from(table)
      .select("*")
      .eq("company_id", params.companyId);

    bundle.tables[table] = data || [];
  }

  const filePath = `exports/${params.companyId}/${params.exportId}.json`;

  const { error: uploadError } = await params.supabase.storage
    .from("workspace-exports")
    .upload(filePath, JSON.stringify(bundle, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data, error } = await params.supabase
    .from("workspace_exports")
    .update({
      status: "completed",
      file_path: filePath,
      completed_at: new Date().toISOString(),
    })
    .eq("id", params.exportId)
    .eq("company_id", params.companyId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "workspace_export.completed",
    description: "Workspace export completed.",
    metadata: {
      export_id: params.exportId,
      file_path: filePath,
    },
  });

  return data;
}
