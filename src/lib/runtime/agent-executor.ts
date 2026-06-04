import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveModelRoute } from "./model-router";
import { callModel } from "./model-call";
import type { AgentRunRecord, RuntimeAgent } from "./types";

function stringifyInput(input: AgentRunRecord["input"]) {
  if (!input) return "";
  if (typeof input === "string") return input;
  return input.prompt || input.task || JSON.stringify(input);
}

function buildSystemPrompt(agent: RuntimeAgent) {
  return [
    `You are ${agent.name}, an AI employee inside Octo.`,
    agent.role ? `Role: ${agent.role}` : "",
    agent.description ? `Description: ${agent.description}` : "",
    agent.instructions || agent.system_prompt || "",
    "You must produce a useful, business-ready result.",
    "Do not claim external actions were completed unless a tool actually executed them.",
    "If an action requires approval, clearly say approval is required.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function executeAgentRun(params: {
  supabase: SupabaseClient;
  run: AgentRunRecord;
}) {
  const { supabase, run } = params;

  const { data: agent, error: agentError } = await supabase
    .from("agents")
    .select("*")
    .eq("id", run.agent_id)
    .eq("company_id", run.company_id)
    .single();

  if (agentError || !agent) {
    throw new Error(agentError?.message || "Agent not found");
  }

  const runtimeAgent = agent as RuntimeAgent;

  const route = await resolveModelRoute({
    supabase,
    companyId: run.company_id,
    agent: runtimeAgent,
  });

  const result = await callModel({
    route,
    systemPrompt: buildSystemPrompt(runtimeAgent),
    userPrompt: stringifyInput(run.input),
  });

  await supabase
    .from("agent_runs")
    .update({
      status: "completed",
      output: result.output,
      model_provider: route.provider,
      model_name: route.model,
      prompt_tokens: result.promptTokens,
      completion_tokens: result.completionTokens,
      total_tokens: result.totalTokens,
      cost_cents: 0,
      finished_at: new Date().toISOString(),
    })
    .eq("id", run.id);

  if (route.source === "byok" && route.keyId) {
    await supabase
      .from("agent_model_keys")
      .update({ last_used_at: new Date().toISOString() })
      .eq("id", route.keyId);
  }

  await supabase.from("agent_outputs").insert({
    company_id: run.company_id,
    agent_id: run.agent_id,
    run_id: run.id,
    output: result.output,
    metadata: {
      model_provider: route.provider,
      model_name: route.model,
      key_source: route.source,
    },
  }).throwOnError();

  return result;
}
