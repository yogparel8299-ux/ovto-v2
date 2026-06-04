import type { ModelRoute } from "./types";

export type ModelCallResult = {
  output: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  raw: unknown;
};

export async function callModel(params: {
  route: ModelRoute;
  systemPrompt: string;
  userPrompt: string;
}): Promise<ModelCallResult> {
  if (params.route.provider === "openai") {
    return callOpenAI(params);
  }

  if (params.route.provider === "anthropic") {
    return callAnthropic(params);
  }

  if (params.route.provider === "gemini") {
    return callGemini(params);
  }

  if (params.route.provider === "grok") {
    return callGrok(params);
  }

  throw new Error(`Unsupported model provider: ${params.route.provider}`);
}

async function callOpenAI(params: {
  route: ModelRoute;
  systemPrompt: string;
  userPrompt: string;
}): Promise<ModelCallResult> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.route.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.route.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "OpenAI request failed");
  }

  return {
    output: json.choices?.[0]?.message?.content || "",
    promptTokens: json.usage?.prompt_tokens || 0,
    completionTokens: json.usage?.completion_tokens || 0,
    totalTokens: json.usage?.total_tokens || 0,
    raw: json,
  };
}

async function callAnthropic(params: {
  route: ModelRoute;
  systemPrompt: string;
  userPrompt: string;
}): Promise<ModelCallResult> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": params.route.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.route.model,
      max_tokens: 2048,
      system: params.systemPrompt,
      messages: [{ role: "user", content: params.userPrompt }],
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Anthropic request failed");
  }

  const output =
    Array.isArray(json.content)
      ? json.content.map((part: any) => part.text || "").join("")
      : "";

  return {
    output,
    promptTokens: json.usage?.input_tokens || 0,
    completionTokens: json.usage?.output_tokens || 0,
    totalTokens:
      (json.usage?.input_tokens || 0) + (json.usage?.output_tokens || 0),
    raw: json,
  };
}

async function callGemini(params: {
  route: ModelRoute;
  systemPrompt: string;
  userPrompt: string;
}): Promise<ModelCallResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${params.route.model}:generateContent?key=${params.route.apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${params.systemPrompt}\n\n${params.userPrompt}`,
            },
          ],
        },
      ],
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Gemini request failed");
  }

  return {
    output:
      json.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || "")
        .join("") || "",
    promptTokens: json.usageMetadata?.promptTokenCount || 0,
    completionTokens: json.usageMetadata?.candidatesTokenCount || 0,
    totalTokens: json.usageMetadata?.totalTokenCount || 0,
    raw: json,
  };
}

async function callGrok(params: {
  route: ModelRoute;
  systemPrompt: string;
  userPrompt: string;
}): Promise<ModelCallResult> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.route.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: params.route.model,
      messages: [
        { role: "system", content: params.systemPrompt },
        { role: "user", content: params.userPrompt },
      ],
    }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || "Grok request failed");
  }

  return {
    output: json.choices?.[0]?.message?.content || "",
    promptTokens: json.usage?.prompt_tokens || 0,
    completionTokens: json.usage?.completion_tokens || 0,
    totalTokens: json.usage?.total_tokens || 0,
    raw: json,
  };
}
