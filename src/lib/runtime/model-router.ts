import type { SupabaseClient } from "@supabase/supabase-js";
import { decryptSecret } from "./secrets";
import type { ModelProvider, ModelRoute, RuntimeAgent } from "./types";

function normalizeProvider(provider?: string | null): ModelProvider {
  const value = (provider || "openai").toLowerCase();

  if (value === "anthropic" || value === "claude") return "anthropic";
  if (value === "gemini" || value === "google") return "gemini";
  if (value === "grok" || value === "xai") return "grok";

  return "openai";
}

function defaultModel(provider: ModelProvider) {
  if (provider === "anthropic") return "claude-3-5-sonnet-latest";
  if (provider === "gemini") return "gemini-1.5-flash";
  if (provider === "grok") return "grok-2-latest";
  return "gpt-4o-mini";
}

function platformKey(provider: ModelProvider) {
  if (provider === "anthropic") return process.env.ANTHROPIC_API_KEY || "";
  if (provider === "gemini") return process.env.GEMINI_API_KEY || "";
  if (provider === "grok") return process.env.GROK_API_KEY || "";
  return process.env.OPENAI_API_KEY || "";
}

export async function resolveModelRoute(params: {
  supabase: SupabaseClient;
  companyId: string;
  agent?: RuntimeAgent | null;
  provider?: string | null;
  model?: string | null;
}): Promise<ModelRoute> {
  const provider = normalizeProvider(
    params.provider || params.agent?.model_provider || "openai"
  );

  const model = params.model || params.agent?.model_name || defaultModel(provider);

  if (params.agent?.id) {
    const { data: agentKey } = await params.supabase
      .from("agent_model_keys")
      .select("id, encrypted_key, provider")
      .eq("company_id", params.companyId)
      .eq("agent_id", params.agent.id)
      .eq("provider", provider)
      .eq("is_default", true)
      .maybeSingle();

    if (agentKey?.encrypted_key) {
      return {
        provider,
        model,
        apiKey: decryptSecret(agentKey.encrypted_key),
        source: "byok",
        keyId: agentKey.id,
      };
    }
  }

  const { data: companyKey } = await params.supabase
    .from("agent_model_keys")
    .select("id, encrypted_key, provider")
    .eq("company_id", params.companyId)
    .is("agent_id", null)
    .eq("provider", provider)
    .eq("is_default", true)
    .maybeSingle();

  if (companyKey?.encrypted_key) {
    return {
      provider,
      model,
      apiKey: decryptSecret(companyKey.encrypted_key),
      source: "byok",
      keyId: companyKey.id,
    };
  }

  const key = platformKey(provider);

  if (!key) {
    throw new Error(`No API key available for provider: ${provider}`);
  }

  return {
    provider,
    model,
    apiKey: key,
    source: "platform",
  };
}
