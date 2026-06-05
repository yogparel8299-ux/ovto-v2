import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAudit } from "./run-utils";

export async function cloneAgent(params: {
  supabase: SupabaseClient;
  companyId: string;
  agentId: string;
  createdBy: string;
}) {
  const { data: agent, error } = await params.supabase
    .from("agents")
    .select("*")
    .eq("id", params.agentId)
    .eq("company_id", params.companyId)
    .single();

  if (error || !agent) throw new Error(error?.message || "Agent not found");

  const { data: clone, error: cloneError } = await params.supabase
    .from("agents")
    .insert({
      ...agent,
      id: undefined,
      name: `${agent.name} Copy`,
      status: "idle",
      created_at: undefined,
    })
    .select()
    .single();

  if (cloneError) throw new Error(cloneError.message);

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "agent.cloned",
    description: "Agent cloned.",
    metadata: { source_agent_id: params.agentId, cloned_agent_id: clone.id },
  });

  return clone;
}

export async function cloneWorkflow(params: {
  supabase: SupabaseClient;
  companyId: string;
  workflowId: string;
  createdBy: string;
}) {
  const { data: workflow, error } = await params.supabase
    .from("workflows")
    .select("*")
    .eq("id", params.workflowId)
    .eq("company_id", params.companyId)
    .single();

  if (error || !workflow) throw new Error(error?.message || "Workflow not found");

  const { data: clone, error: cloneError } = await params.supabase
    .from("workflows")
    .insert({
      ...workflow,
      id: undefined,
      name: `${workflow.name} Copy`,
      status: "waiting",
      created_at: undefined,
      updated_at: undefined,
    })
    .select()
    .single();

  if (cloneError) throw new Error(cloneError.message);

  const { data: steps } = await params.supabase
    .from("workflow_steps")
    .select("*")
    .eq("workflow_id", params.workflowId)
    .eq("company_id", params.companyId)
    .order("step_order", { ascending: true });

  for (const step of steps || []) {
    await params.supabase.from("workflow_steps").insert({
      ...step,
      id: undefined,
      workflow_id: clone.id,
      created_at: undefined,
      updated_at: undefined,
    });
  }

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "workflow.cloned",
    description: "Workflow cloned.",
    metadata: { source_workflow_id: params.workflowId, cloned_workflow_id: clone.id },
  });

  return clone;
}

export async function cloneTeam(params: {
  supabase: SupabaseClient;
  companyId: string;
  teamId: string;
  createdBy: string;
}) {
  const { data: team, error } = await params.supabase
    .from("teams")
    .select("*")
    .eq("id", params.teamId)
    .eq("company_id", params.companyId)
    .single();

  if (error || !team) throw new Error(error?.message || "Team not found");

  const { data: clone, error: cloneError } = await params.supabase
    .from("teams")
    .insert({
      ...team,
      id: undefined,
      name: `${team.name} Copy`,
      status: "Waiting",
      created_at: undefined,
      updated_at: undefined,
    })
    .select()
    .single();

  if (cloneError) throw new Error(cloneError.message);

  const { data: teamAgents } = await params.supabase
    .from("team_agents")
    .select("*")
    .eq("team_id", params.teamId)
    .eq("company_id", params.companyId);

  for (const row of teamAgents || []) {
    await params.supabase.from("team_agents").insert({
      ...row,
      id: undefined,
      team_id: clone.id,
      created_at: undefined,
    });
  }

  await writeAudit({
    supabase: params.supabase,
    companyId: params.companyId,
    eventType: "team.cloned",
    description: "Team cloned.",
    metadata: { source_team_id: params.teamId, cloned_team_id: clone.id },
  });

  return clone;
}
