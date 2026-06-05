import type { SupabaseClient } from "@supabase/supabase-js";

export async function rollbackAgent(params: {
  supabase: SupabaseClient;
  companyId: string;
  agentId: string;
  version: number;
}) {
  const { data: snapshot, error } = await params.supabase
    .from("agent_versions")
    .select("*")
    .eq("company_id", params.companyId)
    .eq("agent_id", params.agentId)
    .eq("version", params.version)
    .single();

  if (error || !snapshot) {
    throw new Error("Agent version not found");
  }

  const { data } = await params.supabase
    .from("agents")
    .update({
      name: snapshot.name,
      role: snapshot.role,
      instructions: snapshot.instructions,
      system_prompt: snapshot.system_prompt,
      model_provider: snapshot.model_provider,
      model_name: snapshot.model_name,
      permissions: snapshot.permissions,
      metadata: snapshot.metadata,
      version: snapshot.version,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.agentId)
    .eq("company_id", params.companyId)
    .select()
    .single();

  return data;
}

export async function rollbackWorkflow(params: {
  supabase: SupabaseClient;
  companyId: string;
  workflowId: string;
  version: number;
  rolledBackBy: string;
  reason?: string;
}) {
  const { data: snapshot, error } = await params.supabase
    .from("workflow_versions")
    .select("*")
    .eq("company_id", params.companyId)
    .eq("workflow_id", params.workflowId)
    .eq("version", params.version)
    .single();

  if (error || !snapshot) {
    throw new Error("Workflow version not found");
  }

  const { data } = await params.supabase
    .from("workflows")
    .update({
      name: snapshot.name,
      description: snapshot.description,
      trigger_type: snapshot.trigger_type,
      approval_required: snapshot.approval_required,
      metadata: snapshot.metadata,
      version: snapshot.version,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.workflowId)
    .eq("company_id", params.companyId)
    .select()
    .single();

  await params.supabase
    .from("workflow_rollback_history")
    .insert({
      company_id: params.companyId,
      workflow_id: params.workflowId,
      rolled_back_from_version: data?.version,
      rolled_back_to_version: snapshot.version,
      rollback_reason: params.reason || "manual",
      rolled_back_by: params.rolledBackBy,
      snapshot,
    });

  return data;
}

export async function rollbackTeam(params: {
  supabase: SupabaseClient;
  companyId: string;
  teamId: string;
  version: number;
}) {
  const { data: snapshot, error } = await params.supabase
    .from("team_versions")
    .select("*")
    .eq("company_id", params.companyId)
    .eq("team_id", params.teamId)
    .eq("version", params.version)
    .single();

  if (error || !snapshot) {
    throw new Error("Team version not found");
  }

  const { data } = await params.supabase
    .from("teams")
    .update({
      name: snapshot.name,
      description: snapshot.description,
      objective: snapshot.objective,
      leadership_agent_id: snapshot.leadership_agent_id,
      chain_of_command: snapshot.chain_of_command,
      delegation_rules: snapshot.delegation_rules,
      permissions: snapshot.permissions,
      metadata: snapshot.metadata,
      version: snapshot.version,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.teamId)
    .eq("company_id", params.companyId)
    .select()
    .single();

  return data;
}
