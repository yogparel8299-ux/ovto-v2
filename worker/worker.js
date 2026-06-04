import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

const POLL_MS = Number(process.env.WORKER_POLL_MS || 3000);
const CONCURRENCY = Number(process.env.WORKER_CONCURRENCY || 3);

let active = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getSecretKey() {
  const secret =
    process.env.OCTO_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "development-only-secret";

  return crypto.createHash("sha256").update(secret).digest();
}

function decryptSecret(value) {
  const [ivRaw, tagRaw, encryptedRaw] = String(value).split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Invalid encrypted key");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    getSecretKey(),
    Buffer.from(ivRaw, "base64")
  );

  decipher.setAuthTag(Buffer.from(tagRaw, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64")),
    decipher.final(),
  ]).toString("utf8");
}

function normalizeProvider(provider) {
  const value = String(provider || "openai").toLowerCase();
  if (value === "claude" || value === "anthropic") return "anthropic";
  if (value === "google" || value === "gemini") return "gemini";
  if (value === "xai" || value === "grok") return "grok";
  return "openai";
}

function defaultModel(provider) {
  if (provider === "anthropic") return "claude-3-5-sonnet-latest";
  if (provider === "gemini") return "gemini-1.5-flash";
  if (provider === "grok") return "grok-2-latest";
  return "gpt-4o-mini";
}

function platformKey(provider) {
  if (provider === "anthropic") return process.env.ANTHROPIC_API_KEY || "";
  if (provider === "gemini") return process.env.GEMINI_API_KEY || "";
  if (provider === "grok") return process.env.GROK_API_KEY || "";
  return process.env.OPENAI_API_KEY || "";
}

async function resolveModelRoute(companyId, agent) {
  const provider = normalizeProvider(agent.model_provider || "openai");
  const model = agent.model_name || defaultModel(provider);

  const { data: agentKey } = await supabase
    .from("agent_model_keys")
    .select("id, encrypted_key")
    .eq("company_id", companyId)
    .eq("agent_id", agent.id)
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

  const { data: companyKey } = await supabase
    .from("agent_model_keys")
    .select("id, encrypted_key")
    .eq("company_id", companyId)
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
    throw new Error(`Missing model key for ${provider}`);
  }

  return {
    provider,
    model,
    apiKey: key,
    source: "platform",
  };
}

async function callModel(route, systemPrompt, userPrompt) {
  if (route.provider === "openai") {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${route.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: route.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || "OpenAI failed");

    return {
      output: json.choices?.[0]?.message?.content || "",
      promptTokens: json.usage?.prompt_tokens || 0,
      completionTokens: json.usage?.completion_tokens || 0,
      totalTokens: json.usage?.total_tokens || 0,
    };
  }

  if (route.provider === "anthropic") {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": route.apiKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: route.model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || "Claude failed");

    return {
      output: Array.isArray(json.content)
        ? json.content.map((p) => p.text || "").join("")
        : "",
      promptTokens: json.usage?.input_tokens || 0,
      completionTokens: json.usage?.output_tokens || 0,
      totalTokens:
        (json.usage?.input_tokens || 0) + (json.usage?.output_tokens || 0),
    };
  }

  if (route.provider === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${route.model}:generateContent?key=${route.apiKey}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
          },
        ],
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || "Gemini failed");

    return {
      output:
        json.candidates?.[0]?.content?.parts
          ?.map((p) => p.text || "")
          .join("") || "",
      promptTokens: json.usageMetadata?.promptTokenCount || 0,
      completionTokens: json.usageMetadata?.candidatesTokenCount || 0,
      totalTokens: json.usageMetadata?.totalTokenCount || 0,
    };
  }

  if (route.provider === "grok") {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${route.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: route.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || "Grok failed");

    return {
      output: json.choices?.[0]?.message?.content || "",
      promptTokens: json.usage?.prompt_tokens || 0,
      completionTokens: json.usage?.completion_tokens || 0,
      totalTokens: json.usage?.total_tokens || 0,
    };
  }

  throw new Error(`Unsupported provider: ${route.provider}`);
}

function inputToPrompt(input) {
  if (!input) return "";
  if (typeof input === "string") return input;
  return input.prompt || input.task || JSON.stringify(input);
}

function buildSystemPrompt(agent) {
  return [
    `You are ${agent.name || "an AI worker"} inside Octo.`,
    agent.role ? `Role: ${agent.role}` : "",
    agent.description ? `Description: ${agent.description}` : "",
    agent.instructions || agent.system_prompt || "",
    "Return a clear, useful, business-ready result.",
    "Do not claim you used external tools unless a tool was actually executed.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

async function claimJob() {
  const { data: jobs, error } = await supabase
    .from("agent_runs")
    .select("*")
    .eq("status", "queued")
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    console.error("Queue fetch error:", error.message);
    return null;
  }

  const job = jobs?.[0];
  if (!job) return null;

  const { data: claimed, error: claimError } = await supabase
    .from("agent_runs")
    .update({
      status: "running",
      started_at: new Date().toISOString(),
    })
    .eq("id", job.id)
    .eq("status", "queued")
    .select()
    .single();

  if (claimError || !claimed) return null;

  return claimed;
}

async function runJob(job) {
  active += 1;

  try {
    console.log("Running agent job:", job.id);

    const { data: agent, error: agentError } = await supabase
      .from("agents")
      .select("*")
      .eq("id", job.agent_id)
      .eq("company_id", job.company_id)
      .single();

    if (agentError || !agent) {
      throw new Error(agentError?.message || "Agent not found");
    }

    const route = await resolveModelRoute(job.company_id, agent);

    const result = await callModel(
      route,
      buildSystemPrompt(agent),
      inputToPrompt(job.input)
    );

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
      .eq("id", job.id);

    if (route.source === "byok" && route.keyId) {
      await supabase
        .from("agent_model_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", route.keyId);
    }

    await supabase.from("agent_outputs").insert({
      company_id: job.company_id,
      agent_id: job.agent_id,
      run_id: job.id,
      output: result.output,
      metadata: {
        model_provider: route.provider,
        model_name: route.model,
        key_source: route.source,
      },
    });

    console.log("Completed agent job:", job.id);
  } catch (error) {
    console.error("Agent job failed:", job.id, error.message);

    await supabase
      .from("agent_runs")
      .update({
        status: "failed",
        error_message: error.message,
        finished_at: new Date().toISOString(),
      })
      .eq("id", job.id);
  } finally {
    active -= 1;
  }
}

async function loop() {
  console.log("Octo worker started");

  while (true) {
    try {
      while (active < CONCURRENCY) {
        const job = await claimJob();
        if (!job) break;
        runJob(job);
      }
    } catch (error) {
      console.error("Worker loop error:", error.message);
    }

    await sleep(POLL_MS);
  }
}

loop();
