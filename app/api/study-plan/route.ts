import { NextResponse } from "next/server";
import { getAllSections, getTopicsBySection } from "@/lib/data/curriculum";
import { getAllDemoProgress } from "@/lib/demo/store";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";

export async function POST(req: Request) {
  const { examDate, targetScore, hoursPerWeek = 20 } = await req.json();

  const progress = getAllDemoProgress();
  const weakTopics = progress
    .filter((p) => p.readiness_score < 70)
    .map((p) => p.topic_id);

  const allTopics = getAllSections().flatMap((s) =>
    getTopicsBySection(s.slug).map((t) => ({
      id: t.id,
      name: t.name,
      section: s.name,
      readiness: progress.find((p) => p.topic_id === t.id)?.readiness_score ?? 40,
    }))
  );

  const sorted = [...allTopics].sort((a, b) => a.readiness - b.readiness);

  const plan = {
    examDate: examDate ?? null,
    targetScore: targetScore ?? 510,
    hoursPerWeek,
    weeks: buildWeeklyPlan(sorted, hoursPerWeek),
    priorities: sorted.slice(0, 5).map((t) => ({
      topicId: t.id,
      topicName: t.name,
      reason:
        t.readiness < 60
          ? "Foundational gap — high downstream impact"
          : "Below target readiness",
    })),
    weakTopicIds: weakTopics,
  };

  if (isOpenAIConfigured()) {
    try {
      const summary = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Summarize this MCAT study plan in 3 motivating sentences. No copyrighted content.",
          },
          { role: "user", content: JSON.stringify(plan) },
        ],
      });
      return NextResponse.json({
        plan,
        aiSummary: summary.choices[0]?.message?.content,
      });
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ plan });
}

function buildWeeklyPlan(
  topics: { id: string; name: string; section: string; readiness: number }[],
  hoursPerWeek: number
) {
  const blocksPerWeek = Math.max(3, Math.floor(hoursPerWeek / 2));
  const weeks: Array<{ week: number; sessions: Array<{ topic: string; focus: string; minutes: number }> }> = [];

  for (let w = 0; w < 4; w++) {
    const sessions = [];
    for (let i = 0; i < blocksPerWeek; i++) {
      const t = topics[(w * blocksPerWeek + i) % topics.length];
      sessions.push({
        topic: `${t.name} (${t.section})`,
        focus:
          t.readiness < 55
            ? "Before You Start briefing + mini quiz"
            : "Practice quiz + error review",
        minutes: Math.round((hoursPerWeek * 60) / blocksPerWeek),
      });
    }
    weeks.push({ week: w + 1, sessions });
  }
  return weeks;
}
