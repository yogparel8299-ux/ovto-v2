export type ModelProvider = "openai" | "anthropic" | "gemini" | "grok";

export type RuntimeAgent = {
  id: string;
  company_id: string;
  name: string;
  role?: string | null;
  status?: string | null;
  instructions?: string | null;
  system_prompt?: string | null;
  description?: string | null;
  model_provider?: string | null;
  model_name?: string | null;
};

export type AgentRunInput = {
  prompt?: string;
  task?: string;
  context?: string;
  [key: string]: unknown;
};

export type AgentRunRecord = {
  id: string;
  company_id: string;
  agent_id: string;
  task_id?: string | null;
  status: string;
  trigger_source?: string | null;
  trigger_payload?: unknown;
  input?: AgentRunInput | string | null;
  output?: string | null;
  tool_calls?: unknown;
  model_provider?: string | null;
  model_name?: string | null;
  prompt_tokens?: number | null;
  completion_tokens?: number | null;
  total_tokens?: number | null;
  cost_cents?: number | null;
  error_message?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  created_at?: string | null;
};

export type ModelRoute = {
  provider: ModelProvider;
  model: string;
  apiKey: string;
  source: "byok" | "platform";
  keyId?: string;
};
