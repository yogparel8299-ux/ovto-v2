import type { SupabaseClient } from "@supabase/supabase-js";

export async function snapshotAgentVersion(params: {
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

  const { count } = await params.supabase
    .from("agent_versions")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", params.agentId);

  const { data, error: versionError } = await params.supabase
    .from("agent_versions")
    .insert({
      company_id: params.companyId,
      agent_id: params.agentId,
      version: Number(count || 0) + 1,
      name: agent.name,
      role: agent.role,
      instructions: agent.instructions || null,
      system_prompt: agent.system_prompt || null,
      model_provider: agent.model_provider || null,
      model_name: agent.model_name || null,
      permissions: agent.permissions || {},
      metadata: agent.metadata || {},
      created_by: params.createdBy,
    })
    .select()
    .single();

  if (versionError) throw new Error(versionError.message);
  return data;
}

export async function snapshotWorkflowVersion(params: {
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

  const { count } = await params.supabase
    .from("workflow_versions")
    .select("*", { count: "exact", head: true })
    .eq("workflow_id", params.workflowId);

  const { data, error: versionError } = await params.supabase
    .from("workflow_versions")
    .insert({
      company_id: params.companyId,
      workflow_id: params.workflowId,
      version: Number(count || 0) + 1,
      name: workflow.name,
      description: workflow.description || "",
      trigger_type: workflow.trigger_type || "manual",
      approval_required: Boolean(workflow.approval_required),
      metadata: workflow.metadata || {},
      created_by: params.createdBy,
    })
    .select()
    .single();

  if (versionError) throw new Error(versionError.message);
  return data;
}

export async function snapshotTeamVersion(params: {
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

  const { count } = await params.supabase
    .from("team_versions")
    .select("*", { count: "exact", head: true })
    .eq("team_id", params.teamId);

  const { data, error: versionError } = await params.supabase
    .from("team_versions")
    .insert({
      company_id: params.companyId,
      team_id: params.teamId,
      version: Number(count || 0) + 1,
      name: team.name,
      description: team.description || "",
      objective: team.objective || "",
      leadership_agent_id: team.leadership_agent_id || null,
      chain_of_command: team.chain_of_command || {},
      delegation_rules: team.delegation_rules || {},
      permissions: team.permissions || {},
      metadata: team.metadata || {},
      created_by: params.createdBy,
    })
    .select()
    .single();

  if (versionError) throw new Error(versionError.message);
  return data;
}
