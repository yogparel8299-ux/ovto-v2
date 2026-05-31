import type { MockFile } from "@/types";
import { getSupabase } from "./client";
import { formatTimeAgo } from "./dashboard";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${mb.toFixed(1)} MB`;
}

export function mapFileRow(row: Record<string, unknown>): MockFile {
  const sizeBytes = Number(row.size_bytes ?? 0);
  return {
    name: String(row.name ?? "Untitled"),
    size: formatFileSize(sizeBytes),
    type: String(row.file_type ?? "Document"),
    uploadedAt: formatTimeAgo(String(row.created_at ?? new Date().toISOString())),
  };
}

export async function fetchFiles(companyId: string): Promise<MockFile[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("files")
    .select("id, name, size_bytes, file_type, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data.map((row) => mapFileRow(row));
}

export async function insertFile(
  companyId: string,
  file: File
): Promise<MockFile | null> {
  const supabase = getSupabase();
  const extension = file.name.split(".").pop()?.toUpperCase() ?? "Document";
  const { data, error } = await supabase
    .from("files")
    .insert({
      company_id: companyId,
      name: file.name,
      size_bytes: file.size,
      file_type: extension,
    })
    .select("id, name, size_bytes, file_type, created_at")
    .single();

  if (error || !data) return null;
  return mapFileRow(data);
}
