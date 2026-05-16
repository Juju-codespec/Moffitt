import type { BeforeYouStartBriefing, McatTopic } from "@/types";

export function generateFallbackBriefing(
  topic: McatTopic,
  sectionName: string
): BeforeYouStartBriefing {
  const equations = (topic.metadata.equations ?? []).map((eq) => ({
    name: eq.split(":")[0] ?? eq,
    formula: eq.includes(":") ? eq.split(":").slice(1).join(":").trim() : eq,
    whenToUse: "Apply when the passage or stem describes this physical/chemical setup.",
    pitfalls: "Watch units and sign conventions.",
  }));

  const traps = (topic.metadata.trap_patterns ?? ["Overgeneralizing from one example"]).map(
    (trap) => ({
      trap,
      whyTempting: "It sounds plausible without full passage support.",
      howToAvoid: "Anchor every choice to explicit passage or equation logic.",
    })
  );

  return {
    overview: `Before starting the ${topic.name} QBank in ${sectionName}, lock in the high-yield frameworks that drive most misses: definitions, representative setups, and how MCAT writers disguise familiar concepts.`,
    commonStruggles: [
      "Rushing without identifying the underlying model (e.g., static vs flowing, strong vs weak acid)",
      "Memorizing equations without knowing when they apply",
      "Choosing answers that are true but not the best answer to the question asked",
    ],
    coreConcepts: (topic.subtopics ?? [{ name: topic.name, high_yield: true }]).map((s) => ({
      name: s.name,
      summary: `Master the definition, typical MCAT presentation, and one worked reasoning path for ${s.name}.`,
      priority: s.high_yield ? ("critical" as const) : ("high" as const),
    })),
    equations,
    patternRecognition: topic.metadata.reasoning_patterns ?? [
      "Label the system first, then select the governing principle",
    ],
    passageTips: topic.metadata.passage_archetypes?.length
      ? topic.metadata.passage_archetypes.map((a) => `For ${a}: map claim vs evidence before answering.`)
      : [
          "Annotate the stem for given vs unknown",
          "Eliminate choices that violate units or extremes",
        ],
    timing: {
      recommendedPace:
        topic.section_slug === "cars"
          ? "~10 min per passage set; 90 sec per question average"
          : "~2 min per discrete; flag multi-step calculations",
      flaggingStrategy:
        "Mark and return to time sinks after clearing confident questions in the block.",
    },
    traps,
    reasoningShortcuts: [
      "Process of elimination with one 'must be true' anchor",
      "Estimate before calculating when answer spacing is wide",
    ],
    prerequisites: (topic.metadata.prerequisiteTopics ?? []).map((slug) => ({
      topicSlug: slug,
      reason: "Foundational gap that causes downstream errors in this topic.",
    })),
    confidenceChecklist: [
      {
        item: `I can explain ${topic.name} core ideas without notes`,
        selfRateHint: "1–5 scale; aim for 4+ before QBank",
      },
      {
        item: "I know when to use each key equation",
        selfRateHint: "Write conditions in words, not just symbols",
      },
      {
        item: "I can spot the top 2 trap answer types",
        selfRateHint: "List them from memory",
      },
    ],
    openingCoachMessage: `You are about to begin the ${topic.name} QBank. Here's exactly what you need to master first to maximize your score—focus on the checklist, then attack questions with these traps in mind.`,
  };
}
