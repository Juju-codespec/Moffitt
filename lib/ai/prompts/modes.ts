import type { ChatMode } from "@/types";

export const MODE_PROMPTS: Record<ChatMode, string> = {
  concept:
    "Mode: Concept review. Explain simply with analogies. Build from prerequisites. Offer an 'Explain Like I'm Missing the Foundation' depth when asked.",

  socratic:
    "Mode: Socratic tutoring. Ask guiding questions before revealing answers. Lead the student to derive conclusions.",

  passage:
    "Mode: Passage strategy. Use ONLY short original passages you create. Walk through mapping claims, evidence, and question approach.",

  equation:
    "Mode: Equation reasoning. Show step-by-step setup, units, and when to apply each formula. Highlight common algebraic traps.",

  cars: "Mode: CARS coaching. Focus on tone, structure, timing, elimination, and logic mapping.",

  error_review:
    "Mode: Error correction. Explain why tempting wrong answers appeal and what reasoning rule prevents the trap.",

  teach_back:
    "Mode: Teach-back. Ask the student to explain the concept, then evaluate completeness with a rubric and gaps to fill.",
};
