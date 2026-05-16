import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { retrieveContext } from "@/lib/ai/rag";
import { buildSystemPrompt } from "@/lib/ai/router";
import {
  BRIEFING_JSON_INSTRUCTION,
  getBriefingModeInstruction,
} from "@/lib/ai/prompts/briefing";
import { beforeYouStartSchema } from "@/lib/ai/schemas";
import { generateFallbackBriefing } from "./fallback";
import type { BeforeYouStartBriefing, BriefingMode, McatTopic } from "@/types";
import { getSectionBySlug } from "@/lib/data/curriculum";

export async function generateBriefing(
  topic: McatTopic,
  mode: BriefingMode
): Promise<BeforeYouStartBriefing> {
  const section = getSectionBySlug(topic.section_slug);
  const sectionName = section?.name ?? topic.section_slug;

  if (!isOpenAIConfigured()) {
    return generateFallbackBriefing(topic, sectionName);
  }

  const ragContext = await retrieveContext({
    query: `${topic.name} MCAT preparation high yield equations traps`,
    section: topic.section_slug,
    topic: topic.slug,
  });

  const system = buildSystemPrompt({
    section: topic.section_slug,
    topicName: topic.name,
    ragContext,
    extra: `${getBriefingModeInstruction(mode)}\n\n${BRIEFING_JSON_INSTRUCTION}`,
  });

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Generate a "Before You Start This QBank" briefing for topic: ${topic.name} (${sectionName}). Subtopics: ${(topic.subtopics ?? []).map((s) => s.name).join(", ")}. Metadata: ${JSON.stringify(topic.metadata)}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response");
    const parsed = beforeYouStartSchema.parse(JSON.parse(raw));
    return parsed;
  } catch {
    return generateFallbackBriefing(topic, sectionName);
  }
}
