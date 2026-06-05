import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAudit } from "./run-utils";

const RESTORE_TABLES = [
  "agents",
  "teams",
  "team_agents",
  "workflows",
  "workflow_steps",
  "datasets",
  "dataset_chunks",
  "skills",
  "agent_skills",
  "agent_datasets",
  "approvals",
  "agent_schedules",
];

export async function restoreWorkspaceExport(params: {
  supabase: SupabaseClient;
  companyId: string;
  exportId: string;
  restoredBy: string;
}) {
  const { data: exportJob, error } = await params.supabase
    .from("workspace_exports")
    .select("*")
    .eq("id", params.exportId)
    .eq("company_id", params.companyId)
    .single();

  if (error || !exportJob) {
    throw new Error(error?.message || "Export not found");
  }

  if (!exportJob.file_path) {
    throw new Error("Export has no file_path");
  }

  const { data: file, error: downloadError } = await params.supabase.storage
    .from("workspace-exports")
    .download(exportJob.file_path);

  if (downloadError || !file) {
    throw new Error(downloadError?.message || "Could not download export file");
  }

  const text = await file.text();
  const bundle = JSON.parse(text);
  const tables = bundle.tables || {};

  const restored: Record<string, number> = {};

  for (const table of RESTORE_TABLES) {
    const rows = Array.isArray(tables[table]) ? tables[table] : [];
    restored[table] = 0;

    for (const row of rows) {
      const restoredRow = {
        ...row,
        company_id: params.companyId,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      };

      const { error: insertError } = await params.supabase
        .from(table)
        .insert(restoredRow);

      if (!insertError) restored[table] += 1;
    }
  }

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "workspace.restore.completed",
    description: "Workspace export restored.",
    metadata: {
      export_id: params.exportId,
      restored_by: params.restoredBy,
      restored,
    },
  });

  return {
    restored,
  };
}
