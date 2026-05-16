import type { ReadinessSubscores } from "@/types";

export interface ReadinessInputs {
  quizAccuracy?: number;
  equationDrillAccuracy?: number;
  carsScore?: number;
  checklistCompletion?: number;
  avgTimePerQuestionSec?: number;
  targetTimePerQuestionSec?: number;
}

const WEIGHTS = {
  content: 0.35,
  equations: 0.2,
  passage: 0.25,
  timing: 0.2,
};

export function computeReadiness(inputs: ReadinessInputs): {
  readiness_score: number;
  subscores: ReadinessSubscores;
} {
  const content = clamp(
    (inputs.quizAccuracy ?? 50) * 0.85 + (inputs.checklistCompletion ?? 0) * 0.15
  );

  const equations = clamp(inputs.equationDrillAccuracy ?? inputs.quizAccuracy ?? 45);

  const passage = clamp(inputs.carsScore ?? inputs.quizAccuracy ?? 50);

  let timing = 50;
  if (inputs.avgTimePerQuestionSec && inputs.targetTimePerQuestionSec) {
    const ratio =
      inputs.targetTimePerQuestionSec / inputs.avgTimePerQuestionSec;
    timing = clamp(ratio * 70 + 15);
  }

  const readiness_score = Math.round(
    content * WEIGHTS.content +
      equations * WEIGHTS.equations +
      passage * WEIGHTS.passage +
      timing * WEIGHTS.timing
  );

  const weak_subskills: string[] = [];
  if (content < 60) weak_subskills.push("Content mastery");
  if (equations < 60) weak_subskills.push("Equation familiarity");
  if (passage < 60) weak_subskills.push("Passage readiness");
  if (timing < 60) weak_subskills.push("Timing");

  return {
    readiness_score,
    subscores: {
      content: Math.round(content),
      equations: Math.round(equations),
      passage: Math.round(passage),
      timing: Math.round(timing),
      weak_subskills,
    },
  };
}

function clamp(n: number) {
  return Math.min(100, Math.max(0, n));
}
