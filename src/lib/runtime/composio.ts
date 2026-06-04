import type { SupabaseClient } from "@supabase/supabase-js";

export type ToolExecutionInput = {
  companyId: string;
  agentId?: string | null;
  provider: string;
  action: string;
  payload: Record<string, unknown>;
  approvalId?: string | null;
};

const RISKY_ACTIONS = [
  "send",
  "post",
  "delete",
  "pay",
  "refund",
  "purchase",
  "contract",
  "message",
  "email",
];

export function requiresApproval(action: string) {
  const lower = action.toLowerCase();
  return RISKY_ACTIONS.some((word) => lower.includes(word));
}

export async function executeComposioTool(params: {
  supabase: SupabaseClient;
  input: ToolExecutionInput;
}) {
  const { supabase, input } = params;

  const { data: integration } = await supabase
    .from("integrations")
    .select("*")
    .eq("company_id", input.companyId)
    .eq("provider", input.provider)
    .eq("status", "connected")
    .maybeSingle();

  if (!integration) {
    throw new Error(`No connected integration found for ${input.provider}`);
  }

  if (requiresApproval(input.action) && !input.approvalId) {
    const { data: approval, error } = await supabase
      .from("approvals")
      .insert({
        company_id: input.companyId,
        requested_by_agent: input.agentId || null,
        title: `Approval required: ${input.provider}.${input.action}`,
        description: "An AI worker wants to perform an external action.",
        approval_type: "tool_action",
        payload: {
          provider: input.provider,
          action: input.action,
          payload: input.payload,
        },
        status: "pending",
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    await supabase.from("tool_usage_logs").insert({
      company_id: input.companyId,
      agent_id: input.agentId || null,
      provider: input.provider,
      action: input.action,
      status: "waiting_for_approval",
      request_payload: input.payload,
      response_payload: { approval_id: approval.id },
    });

    return {
      status: "waiting_for_approval",
      approval_id: approval.id,
      result: null,
    };
  }

  const apiKey = process.env.COMPOSIO_API_KEY;

  if (!apiKey) {
    throw new Error("Missing COMPOSIO_API_KEY");
  }

  const response = await fetch("https://backend.composio.dev/api/v2/actions/execute", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      connected_account_id: integration.composio_account_id,
      action: input.action,
      params: input.payload,
    }),
  });

  const json = await response.json();

  await supabase.from("tool_usage_logs").insert({
    company_id: input.companyId,
    agent_id: input.agentId || null,
    provider: input.provider,
    action: input.action,
    status: response.ok ? "completed" : "failed",
    request_payload: input.payload,
    response_payload: json,
  });

  if (!response.ok) {
    throw new Error(json?.message || json?.error || "Composio action failed");
  }

  return {
    status: "completed",
    approval_id: null,
    result: json,
  };
}
