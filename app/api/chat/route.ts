import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { isOpenAIConfigured } from "@/lib/openai";

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
import { buildSystemPrompt } from "@/lib/ai/router";
import { retrieveContext } from "@/lib/ai/rag";
import { getTopicById } from "@/lib/data/curriculum";
import type { ChatMode, McatSectionSlug } from "@/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, mode = "concept", topicId, section, foundationMode } =
    await req.json();

  let topicName: string | undefined;
  let sectionSlug = section as McatSectionSlug | undefined;

  if (topicId) {
    const topic = getTopicById(topicId);
    if (topic) {
      topicName = topic.name;
      sectionSlug = topic.section_slug;
    }
  }

  const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === "user");
  const query = lastUser?.content ?? topicName ?? "MCAT tutoring";

  const ragContext = await retrieveContext({
    query: String(query),
    section: sectionSlug,
    topic: topicId ? getTopicById(topicId)?.slug : undefined,
  });

  const chatMode = (foundationMode ? "concept" : mode) as ChatMode;

  const system = buildSystemPrompt({
    section: sectionSlug,
    topicName,
    mode: chatMode,
    ragContext,
    extra: foundationMode
      ? "The student requested foundation-level explanation. Start from prerequisites and build up simply."
      : undefined,
  });

  if (!isOpenAIConfigured()) {
    return new Response(
      JSON.stringify({
        error: "OpenAI not configured. Set OPENAI_API_KEY for live tutoring.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const result = streamText({
    model: openaiProvider("gpt-4o"),
    system,
    messages,
    temperature: chatMode === "socratic" ? 0.5 : 0.4,
  });

  return result.toUIMessageStreamResponse();
}
