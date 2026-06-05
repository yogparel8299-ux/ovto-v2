import type { SupabaseClient } from "@supabase/supabase-js";

export function chunkText(text: string, size = 1200) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];

  for (let i = 0; i < clean.length; i += size) {
    chunks.push(clean.slice(i, i + size));
  }

  return chunks.filter(Boolean);
}

export async function createEmbedding(text: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required for embeddings");

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Embedding request failed");
  }

  return json.data?.[0]?.embedding || [];
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export async function ingestDatasetText(params: {
  supabase: SupabaseClient;
  companyId: string;
  datasetId: string;
  text: string;
}) {
  const chunks = chunkText(params.text);
  const inserted: unknown[] = [];

  for (let index = 0; index < chunks.length; index++) {
    const content = chunks[index];
    const embedding = await createEmbedding(content);

    const { data, error } = await params.supabase
      .from("dataset_chunks")
      .insert({
        company_id: params.companyId,
        dataset_id: params.datasetId,
        content,
        chunk_index: index,
        embedding,
        metadata: {
          embedding_model: "text-embedding-3-small",
        },
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    inserted.push(data);
  }

  await params.supabase
    .from("datasets")
    .update({
      status: "processed",
      metadata: {
        chunks_count: chunks.length,
        processed_at: new Date().toISOString(),
      },
    })
    .eq("id", params.datasetId);

  return {
    chunksCreated: inserted.length,
  };
}

export async function vectorSearch(params: {
  supabase: SupabaseClient;
  companyId: string;
  query: string;
  limit?: number;
}) {
  const queryEmbedding = await createEmbedding(params.query);

  const { data, error } = await params.supabase
    .from("dataset_chunks")
    .select("id, dataset_id, content, embedding, metadata, created_at")
    .eq("company_id", params.companyId)
    .limit(500);

  if (error) throw new Error(error.message);

  const scored = (data || [])
    .map((chunk) => ({
      ...chunk,
      score: Array.isArray(chunk.embedding)
        ? cosineSimilarity(queryEmbedding, chunk.embedding as number[])
        : 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, params.limit || 8);

  await params.supabase.from("vector_search_queries").insert({
    company_id: params.companyId,
    query: params.query,
    results_count: scored.length,
    metadata: {
      search_type: "client_side_cosine",
      embedding_model: "text-embedding-3-small",
    },
  });

  return scored;
}
