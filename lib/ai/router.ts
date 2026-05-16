import type { ChatMode, McatSectionSlug } from "@/types";
import { GLOBAL_MCAT_COACH_SYSTEM } from "./prompts/global";
import { SECTION_PROMPTS } from "./prompts/sections";
import { MODE_PROMPTS } from "./prompts/modes";

export function buildSystemPrompt(options: {
  section?: McatSectionSlug;
  topicName?: string;
  mode?: ChatMode;
  ragContext?: string;
  weaknesses?: string[];
  extra?: string;
}) {
  const parts = [GLOBAL_MCAT_COACH_SYSTEM];

  if (options.section) {
    parts.push(SECTION_PROMPTS[options.section]);
  }

  if (options.topicName) {
    parts.push(`Current topic: ${options.topicName}. Tailor all guidance to this topic.`);
  }

  if (options.mode) {
    parts.push(MODE_PROMPTS[options.mode]);
  }

  if (options.weaknesses?.length) {
    parts.push(
      `Student weak areas to emphasize: ${options.weaknesses.join(", ")}.`
    );
  }

  if (options.ragContext) {
    parts.push(`REFERENCE KNOWLEDGE (use as ground truth, do not invent conflicting facts):\n${options.ragContext}`);
  }

  if (options.extra) {
    parts.push(options.extra);
  }

  return parts.join("\n\n");
}
