export function predictScoreRange(options: {
  avgReadiness: number;
  avgQuizAccuracy: number;
  studyHoursPerWeek?: number;
}) {
  const { avgReadiness, avgQuizAccuracy, studyHoursPerWeek = 20 } = options;
  const composite = avgReadiness * 0.6 + avgQuizAccuracy * 0.4;
  const volumeBoost = Math.min(8, studyHoursPerWeek / 5);

  const midpoint = Math.round(472 + (composite / 100) * 38 + volumeBoost);
  const spread = Math.round(6 - composite / 25);

  return {
    low: Math.max(472, midpoint - spread),
    high: Math.min(528, midpoint + spread),
    disclaimer:
      "Estimate based on practice readiness and accuracy trends—not an official AAMC prediction.",
  };
}
