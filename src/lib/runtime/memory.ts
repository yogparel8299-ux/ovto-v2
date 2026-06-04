import type { SupabaseClient } from "@supabase/supabase-js";

export type MemoryResult = {
  source: string;
  title: string;
  content: string;
  score?: number;
};

export async function searchCompanyMemory(params: {
  supabase: SupabaseClient;
  companyId: string;
  query: string;
  limit?: number;
}): Promise<MemoryResult[]> {
  const limit = params.limit ?? 8;
  const search = params.query.trim();

  if (!search) return [];

  const results: MemoryResult[] = [];

  const { data: memories } = await params.supabase
    .from("company_brain_memories")
    .select("id, title, content, memory_text, tags, created_at")
    .eq("company_id", params.companyId)
    .or(`title.ilike.%${search}%,content.ilike.%${search}%,memory_text.ilike.%${search}%`)
    .limit(limit);

  for (const row of memories || []) {
    results.push({
      source: "company_brain",
      title: row.title || "Company memory",
      content: row.content || row.memory_text || "",
    });
  }

  const { data: chunks } = await params.supabase
    .from("dataset_chunks")
    .select("id, content, chunk_text, metadata")
    .eq("company_id", params.companyId)
    .or(`content.ilike.%${search}%,chunk_text.ilike.%${search}%`)
    .limit(limit);

  for (const row of chunks || []) {
    results.push({
      source: "dataset_chunk",
      title: row.metadata?.title || "Dataset chunk",
      content: row.content || row.chunk_text || "",
    });
  }

  const { data: agentMemory } = await params.supabase
    .from("agent_memory")
    .select("id, content, memory_text, type, created_at")
    .eq("company_id", params.companyId)
    .or(`content.ilike.%${search}%,memory_text.ilike.%${search}%`)
    .limit(limit);

  for (const row of agentMemory || []) {
    results.push({
      source: "agent_memory",
      title: row.type || "Agent memory",
      content: row.content || row.memory_text || "",
    });
  }

  return results
    .filter((item) => item.content)
    .slice(0, limit);
}

export function buildMemoryContext(memories: MemoryResult[]) {
  if (!memories.length) return "";

  return [
    "Relevant company knowledge:",
    ...memories.map((memory, index) => {
      return `[${index + 1}] ${memory.title} (${memory.source})\n${memory.content}`;
    }),
  ].join("\n\n");
}
