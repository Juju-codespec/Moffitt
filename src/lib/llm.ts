export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type LlmProvider = "ollama" | "openai";

export function getProvider(): LlmProvider {
  const p = process.env.LLM_PROVIDER?.toLowerCase();
  if (p === "openai") return "openai";
  return "ollama";
}

export async function streamChat(
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<void> {
  const provider = getProvider();
  if (provider === "openai") {
    await streamOpenAI(messages, onChunk);
  } else {
    await streamOllama(messages, onChunk);
  }
}

async function streamOllama(
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<void> {
  const base = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_MODEL ?? "llama3.2";

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Ollama error (${res.status}): ${text}. Is Ollama running? Try: ollama serve && ollama pull ${model}`
    );
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body from Ollama");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line) as {
          message?: { content?: string };
          done?: boolean;
        };
        const content = json.message?.content;
        if (content) onChunk(content);
      } catch {
        // skip malformed chunks
      }
    }
  }
}

async function streamOpenAI(
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<void> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is required when LLM_PROVIDER=openai");
  }
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI error (${res.status}): ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error("No response body from OpenAI");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (data === "[DONE]") return;
      try {
        const json = JSON.parse(data) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const content = json.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {
        // skip
      }
    }
  }
}

export type LlmHealth = {
  provider: LlmProvider;
  ok: boolean;
  detail: string;
  models?: string[];
  configuredModel?: string;
};

export async function checkLlmHealth(): Promise<LlmHealth> {
  const provider = getProvider();
  try {
    if (provider === "ollama") {
      const base = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
      const res = await fetch(`${base}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) {
        return { provider, ok: false, detail: `Ollama returned ${res.status}` };
      }
      const data = (await res.json()) as { models?: { name: string }[] };
      const model = process.env.OLLAMA_MODEL ?? "llama3.2";
      const names = data.models?.map((m) => m.name) ?? [];
      const hasModel = names.some(
        (n) => n === model || n.startsWith(`${model}:`)
      );
      if (!hasModel) {
        const hint =
          names.length > 0
            ? `Installed: ${names.slice(0, 3).join(", ")}. Set OLLAMA_MODEL in .env or run: ollama pull ${model}`
            : `Run: ollama pull ${model}`;
        return {
          provider,
          ok: false,
          detail: `Model "${model}" not found. ${hint}`,
          models: names,
          configuredModel: model,
        };
      }
      return {
        provider,
        ok: true,
        detail: `Ollama ready (${model})`,
        models: names,
        configuredModel: model,
      };
    }
    if (!process.env.OPENAI_API_KEY) {
      return { provider, ok: false, detail: "OPENAI_API_KEY not set" };
    }
    return { provider, ok: true, detail: "OpenAI configured" };
  } catch (e) {
    return {
      provider,
      ok: false,
      detail:
        e instanceof Error
          ? e.message
          : "Cannot reach Ollama. Open the Ollama app or run: ollama serve",
    };
  }
}

/** List models Ollama has pulled (empty if Ollama is offline). */
export async function listOllamaModels(): Promise<string[]> {
  const base = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  try {
    const res = await fetch(`${base}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { models?: { name: string }[] };
    return data.models?.map((m) => m.name) ?? [];
  } catch {
    return [];
  }
}
