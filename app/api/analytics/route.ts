import { NextResponse } from "next/server";
import { getAllSections, getTopicsBySection } from "@/lib/data/curriculum";
import { getAllDemoProgress, getDemoStreak, getDemoDailyGoal } from "@/lib/demo/store";
import { predictScoreRange } from "@/lib/analytics/prediction";

export async function GET() {
  const sections = getAllSections();
  const allProgress = getAllDemoProgress();

  const bySection = sections.map((s) => {
    const topics = getTopicsBySection(s.slug);
    const scores = topics.map(
      (t) => allProgress.find((p) => p.topic_id === t.id)?.readiness_score ?? 35
    );
    const avg =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;
    return { section: s.name, slug: s.slug, readiness: avg };
  });

  const avgReadiness =
    allProgress.length > 0
      ? Math.round(
          allProgress.reduce((a, p) => a + p.readiness_score, 0) / allProgress.length
        )
      : 42;

  const weakConcepts = allProgress
    .flatMap((p) =>
      (p.subscores.weak_subskills ?? []).map((w) => ({
        concept: w,
        topic_id: p.topic_id,
        score: p.readiness_score,
      }))
    )
    .slice(0, 8);

  const trend = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().slice(0, 10),
      accuracy: 55 + i * 4 + Math.floor(Math.random() * 5),
      readiness: 40 + i * 5,
    };
  });

  const prediction = predictScoreRange({
    avgReadiness,
    avgQuizAccuracy: trend[trend.length - 1]?.accuracy ?? 60,
  });

  return NextResponse.json({
    bySection,
    avgReadiness,
    weakConcepts,
    trend,
    prediction,
    streak: getDemoStreak(),
    dailyGoal: getDemoDailyGoal(),
    timeManagement: {
      avgSecPerQuestion: 105,
      targetSecPerQuestion: 90,
    },
  });
}
