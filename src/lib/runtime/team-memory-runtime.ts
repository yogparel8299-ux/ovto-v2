import type { SupabaseClient } from "@supabase/supabase-js";
import { writeActivity, writeAudit } from "./run-utils";

export async function writeTeamMemory(params: {
  supabase: SupabaseClient;
  companyId: string;
  teamId: string;
  title: string;
  content: string;
  importance?: number;
  metadata?: Record<string, unknown>;
  createdByRunId?: string | null;
}) {
  const { data, error } = await params.supabase
    .from("team_memory")
    .insert({
      company_id: params.companyId,
      team_id: params.teamId,
      title: params.title,
      content: params.content,
      importance: params.importance ?? 5,
      metadata: params.metadata || {},
      created_by_run_id: params.createdByRunId || null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  await writeActivity({
    supabase: params.supabase,
    companyId: params.companyId,
    type: "team_memory.created",
    title: "Swarm memory saved",
    description: params.title,
    relatedTable: "team_memory",
    relatedId: data.id,
  });

  return data;
}

export async function searchTeamMemory(params: {
  supabase: SupabaseClient;
  companyId: string;
  teamId: string;
  query: string;
  limit?: number;
}) {
  const search = params.query.trim();
  if (!search) return [];

  const { data, error } = await params.supabase
    .from("team_memory")
    .select("*")
    .eq("company_id", params.companyId)
    .eq("team_id", params.teamId)
    .or(`title.ilike.%${search}%,content.ilike.%${search}%`)
    .order("importance", { ascending: false })
    .limit(params.limit || 10);

  if (error) throw new Error(error.message);

  return data || [];
}

export async function writeTeamMessage(params: {
  supabase: SupabaseClient;
  companyId: string;
  teamId: string;
  agentId?: string | null;
  userId?: string | null;
  role: "system" | "agent" | "user";
  content: string;
  conversationId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { data, error } = await params.supabase
    .from("team_messages")
    .insert({
      company_id: params.companyId,
      conversation_id: params.conversationId || null,
      team_id: params.teamId,
      agent_id: params.agentId || null,
      user_id: params.userId || null,
      role: params.role,
      content: params.content,
      metadata: params.metadata || {},
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  return data;
}

export async function syncTeamRunMemory(params: {
  supabase: SupabaseClient;
  companyId: string;
  teamRunId: string;
}) {
  const { data: teamRun, error: teamRunError } = await params.supabase
    .from("team_runs")
    .select("*")
    .eq("id", params.teamRunId)
    .eq("company_id", params.companyId)
    .single();

  if (teamRunError || !teamRun) {
    throw new Error(teamRunError?.message || "Team run not found");
  }

  const agentRunIds = Array.isArray(teamRun.agent_run_ids)
    ? teamRun.agent_run_ids
    : teamRun.output?.queued_agent_runs || [];

  const synced: unknown[] = [];

  for (const agentRunId of agentRunIds) {
    const { data: agentRun } = await params.supabase
      .from("agent_runs")
      .select("*")
      .eq("id", agentRunId)
      .eq("company_id", params.companyId)
      .maybeSingle();

    if (!agentRun?.output) continue;

    const memory = await writeTeamMemory({
      supabase: params.supabase,
      companyId: params.companyId,
      teamId: teamRun.team_id,
      title: `Result from agent run ${agentRun.id}`,
      content: String(agentRun.output),
      importance: 7,
      createdByRunId: teamRun.id,
      metadata: {
        agent_run_id: agentRun.id,
        agent_id: agentRun.agent_id,
        source: "team_run_sync",
      },
    });

    await writeTeamMessage({
      supabase: params.supabase,
      companyId: params.companyId,
      teamId: teamRun.team_id,
      agentId: agentRun.agent_id,
      role: "agent",
      content: String(agentRun.output),
      metadata: {
        agent_run_id: agentRun.id,
        team_run_id: teamRun.id,
      },
    });

    synced.push(memory);
  }

  await params.supabase
    .from("team_runs")
    .update({
      output: {
        ...(teamRun.output || {}),
        memory_synced_at: new Date().toISOString(),
        synced_memories_count: synced.length,
      },
    })
    .eq("id", teamRun.id);

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "team_memory.synced",
    description: "Team run outputs were synced into swarm memory.",
    metadata: {
      team_run_id: teamRun.id,
      team_id: teamRun.team_id,
      synced_count: synced.length,
    },
  });

  return {
    teamRun,
    synced,
  };
}
