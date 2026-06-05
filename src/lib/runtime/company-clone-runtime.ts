import type { SupabaseClient } from "@supabase/supabase-js";
import { writeAudit } from "./run-utils";

export async function cloneCompany(params: {
  supabase: SupabaseClient;
  companyId: string;
  userId: string;
  newName?: string;
}) {
  const { data: company, error } = await params.supabase
    .from("companies")
    .select("*")
    .eq("id", params.companyId)
    .single();

  if (error || !company) throw new Error("Company not found");

  const { data: clonedCompany, error: cloneError } = await params.supabase
    .from("companies")
    .insert({
      owner_id: params.userId,
      name: params.newName || `${company.name} Copy`,
      slug: `${company.slug || company.name.toLowerCase().replace(/\s+/g, "-")}-copy-${Date.now()}`,
      logo_url: company.logo_url,
      description: company.description,
      website: company.website,
      industry: company.industry,
      country: company.country,
      currency: company.currency,
      revenue_cents: 0,
      users_count: 1,
      live_since: new Date().toISOString(),
      workspace_health_score: company.workspace_health_score || 0,
      autopilot_enabled: false,
      read_only_mode: false,
      metadata: {
        ...(company.metadata || {}),
        cloned_from_company_id: params.companyId,
      },
    })
    .select()
    .single();

  if (cloneError) throw new Error(cloneError.message);

  await params.supabase.from("company_members").insert({
    company_id: clonedCompany.id,
    user_id: params.userId,
    role: "owner",
    status: "active",
  });

  const agentIdMap = new Map<string, string>();
  const workflowIdMap = new Map<string, string>();
  const teamIdMap = new Map<string, string>();

  const { data: agents } = await params.supabase
    .from("agents")
    .select("*")
    .eq("company_id", params.companyId);

  for (const agent of agents || []) {
    const { data: clonedAgent, error: agentError } = await params.supabase
      .from("agents")
      .insert({
        ...agent,
        id: undefined,
        company_id: clonedCompany.id,
        created_by: params.userId,
        name: agent.name,
        status: "idle",
        spend_cents: 0,
        current_month_runs: 0,
        failure_count: 0,
        last_run_at: null,
        metadata: {
          ...(agent.metadata || {}),
          cloned_from_agent_id: agent.id,
        },
        created_at: undefined,
        updated_at: undefined,
      })
      .select()
      .single();

    if (!agentError && clonedAgent) {
      agentIdMap.set(agent.id, clonedAgent.id);
    }
  }

  const { data: workflows } = await params.supabase
    .from("workflows")
    .select("*")
    .eq("company_id", params.companyId);

  for (const workflow of workflows || []) {
    const { data: clonedWorkflow, error: workflowError } = await params.supabase
      .from("workflows")
      .insert({
        ...workflow,
        id: undefined,
        company_id: clonedCompany.id,
        created_by: params.userId,
        status: "waiting",
        spend_cents: 0,
        run_count: 0,
        metadata: {
          ...(workflow.metadata || {}),
          cloned_from_workflow_id: workflow.id,
        },
        created_at: undefined,
        updated_at: undefined,
      })
      .select()
      .single();

    if (!workflowError && clonedWorkflow) {
      workflowIdMap.set(workflow.id, clonedWorkflow.id);
    }
  }

  const { data: workflowSteps } = await params.supabase
    .from("workflow_steps")
    .select("*")
    .eq("company_id", params.companyId);

  for (const step of workflowSteps || []) {
    const newWorkflowId = workflowIdMap.get(step.workflow_id);
    if (!newWorkflowId) continue;

    await params.supabase.from("workflow_steps").insert({
      ...step,
      id: undefined,
      company_id: clonedCompany.id,
      workflow_id: newWorkflowId,
      agent_id: step.agent_id ? agentIdMap.get(step.agent_id) || null : null,
      team_id: step.team_id ? teamIdMap.get(step.team_id) || null : null,
      created_at: undefined,
      updated_at: undefined,
    });
  }

  const { data: teams } = await params.supabase
    .from("teams")
    .select("*")
    .eq("company_id", params.companyId);

  for (const team of teams || []) {
    const { data: clonedTeam, error: teamError } = await params.supabase
      .from("teams")
      .insert({
        ...team,
        id: undefined,
        company_id: clonedCompany.id,
        created_by: params.userId,
        status: "Waiting",
        leadership_agent_id: team.leadership_agent_id
          ? agentIdMap.get(team.leadership_agent_id) || null
          : null,
        spend_cents: 0,
        metadata: {
          ...(team.metadata || {}),
          cloned_from_team_id: team.id,
        },
        created_at: undefined,
        updated_at: undefined,
      })
      .select()
      .single();

    if (!teamError && clonedTeam) {
      teamIdMap.set(team.id, clonedTeam.id);
    }
  }

  const { data: teamAgents } = await params.supabase
    .from("team_agents")
    .select("*")
    .eq("company_id", params.companyId);

  for (const row of teamAgents || []) {
    const newTeamId = teamIdMap.get(row.team_id);
    const newAgentId = agentIdMap.get(row.agent_id);

    if (!newTeamId || !newAgentId) continue;

    await params.supabase.from("team_agents").insert({
      ...row,
      id: undefined,
      company_id: clonedCompany.id,
      team_id: newTeamId,
      agent_id: newAgentId,
      created_at: undefined,
    });
  }

  await writeAudit({
    supabase: params.supabase,
    companyId: clonedCompany.id,
    eventType: "company.cloned",
    description: "Company cloned successfully.",
    metadata: {
      source_company_id: params.companyId,
      cloned_company_id: clonedCompany.id,
      agents_cloned: agentIdMap.size,
      workflows_cloned: workflowIdMap.size,
      teams_cloned: teamIdMap.size,
    },
  });

  return {
    company: clonedCompany,
    agents_cloned: agentIdMap.size,
    workflows_cloned: workflowIdMap.size,
    teams_cloned: teamIdMap.size,
  };
}
