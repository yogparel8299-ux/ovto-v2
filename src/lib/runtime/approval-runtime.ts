import type { SupabaseClient } from "@supabase/supabase-js";
import { executeComposioTool } from "./composio";
import { runWorkflow } from "./workflow-runtime";
import { runSwarm } from "./swarm-runtime";
import { nowIso, writeActivity, writeAudit } from "./run-utils";

export async function approveAndResume(params: {
  supabase: SupabaseClient;
  companyId: string;
  approvalId: string;
  approvedBy: string;
}) {
  const { supabase, companyId, approvalId, approvedBy } = params;

  const { data: approval, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", approvalId)
    .eq("company_id", companyId)
    .single();

  if (error || !approval) {
    throw new Error(error?.message || "Approval not found");
  }

  if (approval.status !== "pending") {
    throw new Error("Approval is not pending");
  }

  await supabase
    .from("approvals")
    .update({
      status: "approved",
      approved_by: approvedBy,
      approved_at: nowIso(),
    })
    .eq("id", approvalId);

  await writeActivity({
    supabase,
    companyId,
    agentId: approval.requested_by_agent || null,
    type: "approval.approved",
    title: "Approval accepted",
    description: approval.title || "An approval was accepted.",
    relatedTable: "approvals",
    relatedId: approvalId,
  });

  await writeAudit({
    supabase,
    companyId,
    eventType: "approval.approved",
    description: `Approval approved: ${approval.title}`,
    metadata: {
      approval_id: approvalId,
      approval_type: approval.approval_type,
      approved_by: approvedBy,
    },
  });

  const payload = approval.payload || {};

  if (approval.approval_type === "tool_action") {
    const result = await executeComposioTool({
      supabase,
      input: {
        companyId,
        agentId: approval.requested_by_agent || null,
        provider: payload.provider,
        action: payload.action,
        payload: payload.payload || {},
        approvalId,
      },
    });

    return {
      approval,
      resumed: true,
      resume_type: "tool_action",
      result,
    };
  }

  if (approval.approval_type === "workflow_step") {
    if (payload.workflow_id && payload.objective) {
      const result = await runWorkflow({
        supabase,
        companyId,
        workflowId: payload.workflow_id,
        objective: payload.objective,
        triggerSource: "approval_resume",
        triggerPayload: {
          approval_id: approvalId,
          previous_workflow_run_id: payload.workflow_run_id || null,
          previous_step_id: payload.step_id || null,
        },
      });

      return {
        approval,
        resumed: true,
        resume_type: "workflow",
        result,
      };
    }
  }

  if (approval.approval_type === "swarm_action") {
    if (payload.team_id && payload.objective) {
      const result = await runSwarm({
        supabase,
        companyId,
        teamId: payload.team_id,
        objective: payload.objective,
        triggerSource: "approval_resume",
      });

      return {
        approval,
        resumed: true,
        resume_type: "swarm",
        result,
      };
    }
  }

  return {
    approval,
    resumed: false,
    resume_type: "none",
    result: null,
  };
}

export async function rejectApproval(params: {
  supabase: SupabaseClient;
  companyId: string;
  approvalId: string;
  reason?: string;
}) {
  const { supabase, companyId, approvalId } = params;

  const { data: approval, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", approvalId)
    .eq("company_id", companyId)
    .single();

  if (error || !approval) {
    throw new Error(error?.message || "Approval not found");
  }

  if (approval.status !== "pending") {
    throw new Error("Approval is not pending");
  }

  await supabase
    .from("approvals")
    .update({
      status: "rejected",
      rejected_at: nowIso(),
      rejection_reason: params.reason || "Rejected by user",
    })
    .eq("id", approvalId);

  await writeActivity({
    supabase,
    companyId,
    agentId: approval.requested_by_agent || null,
    type: "approval.rejected",
    title: "Approval rejected",
    description: approval.title || "An approval was rejected.",
    relatedTable: "approvals",
    relatedId: approvalId,
  });

  await writeAudit({
    supabase,
    companyId,
    eventType: "approval.rejected",
    description: `Approval rejected: ${approval.title}`,
    metadata: {
      approval_id: approvalId,
      reason: params.reason || "Rejected by user",
    },
  });

  return {
    approval,
    rejected: true,
  };
}
