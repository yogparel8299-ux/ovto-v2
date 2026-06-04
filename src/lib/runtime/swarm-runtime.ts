import type { SupabaseClient } from "@supabase/supabase-js";
import { nowIso, normalizeText, writeActivity, writeAudit } from "./run-utils";

type SwarmWorker = {
  name?: string;
  role?: string;
  responsibilities?: string;
};

function extractWorkers(team: Record<string, any>): SwarmWorker[] {
  if (Array.isArray(team.workers)) return team.workers;
  return [];
}

async function findAgentForWorker(params: {
  supabase: SupabaseClient;
  companyId: string;
  worker: SwarmWorker;
}) {
  const name = params.worker.name ?? "";
  const role = params.worker.role ?? "";

  if (name) {
    const { data } = await params.supabase
      .from("agents")
      .select("*")
      .eq("company_id", params.companyId)
      .ilike("name", name)
      .maybeSingle();

    if (data) return data;
  }

  if (role) {
    const { data } = await params.supabase
      .from("agents")
      .select("*")
      .eq("company_id", params.companyId)
      .ilike("role", role)
      .limit(1);

    if (data?.[0]) return data[0];
  }

  const { data } = await params.supabase
    .from("agents")
    .select("*")
    .eq("company_id", params.companyId)
    .limit(1);

  return data?.[0] ?? null;
}

export async function runSwarm(params: {
  supabase: SupabaseClient;
  companyId: string;
  teamId: string;
  objective: string;
  triggerSource?: string;
}) {
  const { supabase, companyId, teamId, objective } = params;

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .eq("company_id", companyId)
    .single();

  if (teamError || !team) {
    throw new Error(teamError?.message || "Swarm not found");
  }

  const { data: teamRun, error: runError } = await supabase
    .from("team_runs")
    .insert({
      company_id: companyId,
      team_id: teamId,
      status: "running",
      input: {
        objective,
        trigger_source: params.triggerSource ?? "manual",
      },
      started_at: nowIso(),
    })
    .select()
    .single();

  if (runError) {
    throw new Error(runError.message);
  }

  await writeActivity({
    supabase,
    companyId,
    type: "swarm_run.started",
    title: "AI swarm started",
    description: `Swarm "${team.name}" started working.`,
    relatedTable: "team_runs",
    relatedId: teamRun.id,
  });

  const workers = extractWorkers(team);
  const queuedRuns: any[] = [];

  if (!workers.length) {
    const { data: agents } = await supabase
      .from("agents")
      .select("*")
      .eq("company_id", companyId)
      .limit(5);

    for (const agent of agents || []) {
      const { data: agentRun, error } = await supabase
        .from("agent_runs")
        .insert({
          company_id: companyId,
          agent_id: agent.id,
          status: "queued",
          trigger_source: "swarm",
          trigger_payload: {
            team_id: teamId,
            team_run_id: teamRun.id,
          },
          input: {
            prompt: objective,
            swarm_name: team.name,
            instruction: "Complete your part of this swarm objective.",
          },
        })
        .select()
        .single();

      if (!error && agentRun) queuedRuns.push(agentRun);
    }
  }

  for (const worker of workers) {
    const agent = await findAgentForWorker({
      supabase,
      companyId,
      worker,
    });

    if (!agent) continue;

    const workerPrompt = [
      `Swarm objective: ${objective}`,
      worker.role ? `Your role: ${worker.role}` : "",
      worker.responsibilities ? `Your responsibilities: ${worker.responsibilities}` : "",
      "Complete your part and return a clear output for the swarm manager.",
    ]
      .filter(Boolean)
      .join("\\n\\n");

    const { data: agentRun, error } = await supabase
      .from("agent_runs")
      .insert({
        company_id: companyId,
        agent_id: agent.id,
        status: "queued",
        trigger_source: "swarm",
        trigger_payload: {
          team_id: teamId,
          team_run_id: teamRun.id,
          worker,
        },
        input: {
          prompt: workerPrompt,
          objective,
          swarm_name: team.name,
        },
      })
      .select()
      .single();

    if (!error && agentRun) {
      queuedRuns.push(agentRun);

      await supabase.from("team_run_steps").insert({
        company_id: companyId,
        team_run_id: teamRun.id,
        agent_id: agent.id,
        agent_run_id: agentRun.id,
        status: "queued",
        input: {
          worker,
          objective,
        },
        created_at: nowIso(),
      });
    }
  }

  await supabase
    .from("team_runs")
    .update({
      status: queuedRuns.length ? "running" : "failed",
      output: queuedRuns.length
        ? {
            queued_agent_runs: queuedRuns.map((run) => run.id),
          }
        : {
            error: "No agents were available for this swarm.",
          },
    })
    .eq("id", teamRun.id);

  await writeAudit({
    supabase,
    companyId,
    eventType: "swarm_run.created",
    description: `Swarm run created with ${queuedRuns.length} queued agent runs.`,
    metadata: {
      team_id: teamId,
      team_run_id: teamRun.id,
      queued_agent_runs: queuedRuns.map((run) => run.id),
    },
  });

  return {
    teamRun,
    queuedAgentRuns: queuedRuns,
  };
}
