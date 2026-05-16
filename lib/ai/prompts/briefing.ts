import type { BriefingMode } from "@/types";

export function getBriefingModeInstruction(mode: BriefingMode): string {
  switch (mode) {
    case "high_yield":
      return "Focus ONLY on highest-yield concepts, equations, traps, and strategies. Omit lower-yield details.";
    case "cram":
      return "Last-week cram mode: ultra-condensed essentials, rapid recall triggers, and exam-day tactics only.";
    default:
      return "Provide comprehensive but efficient pre-QBank preparation.";
  }
}

export const BRIEFING_JSON_INSTRUCTION = `Respond with valid JSON matching this structure exactly:
{
  "overview": string,
  "commonStruggles": string[],
  "coreConcepts": [{ "name": string, "summary": string, "priority": "critical"|"high"|"medium" }],
  "equations": [{ "name": string, "formula": string, "whenToUse": string, "pitfalls": string }],
  "patternRecognition": string[],
  "passageTips": string[],
  "timing": { "recommendedPace": string, "flaggingStrategy": string },
  "traps": [{ "trap": string, "whyTempting": string, "howToAvoid": string }],
  "reasoningShortcuts": string[],
  "prerequisites": [{ "topicSlug": string, "reason": string }],
  "confidenceChecklist": [{ "item": string, "selfRateHint": string }],
  "openingCoachMessage": string
}`;
