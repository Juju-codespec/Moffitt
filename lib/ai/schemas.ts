import { z } from "zod";

export const beforeYouStartSchema = z.object({
  overview: z.string(),
  commonStruggles: z.array(z.string()),
  coreConcepts: z.array(
    z.object({
      name: z.string(),
      summary: z.string(),
      priority: z.enum(["critical", "high", "medium"]),
    })
  ),
  equations: z.array(
    z.object({
      name: z.string(),
      formula: z.string(),
      whenToUse: z.string(),
      pitfalls: z.string(),
    })
  ),
  patternRecognition: z.array(z.string()),
  passageTips: z.array(z.string()),
  timing: z.object({
    recommendedPace: z.string(),
    flaggingStrategy: z.string(),
  }),
  traps: z.array(
    z.object({
      trap: z.string(),
      whyTempting: z.string(),
      howToAvoid: z.string(),
    })
  ),
  reasoningShortcuts: z.array(z.string()),
  prerequisites: z.array(
    z.object({
      topicSlug: z.string(),
      reason: z.string(),
    })
  ),
  confidenceChecklist: z.array(
    z.object({
      item: z.string(),
      selfRateHint: z.string(),
    })
  ),
  openingCoachMessage: z.string(),
});

export const quizSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      stem: z.string(),
      choices: z.array(z.string()).length(4),
      correctIndex: z.number().min(0).max(3),
      explanation: z.string(),
      concept: z.string(),
    })
  ),
});
