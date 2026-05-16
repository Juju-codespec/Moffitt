import { NextResponse } from "next/server";
import { getTopicById } from "@/lib/data/curriculum";
import { getDemoProgress, setDemoProgress } from "@/lib/demo/store";
import { computeReadiness } from "@/lib/readiness/scoring";

export async function POST(req: Request) {
  const { topicId, checklistCompletion } = await req.json();
  const topic = getTopicById(topicId);
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const existing = getDemoProgress(topicId);
  const { readiness_score, subscores } = computeReadiness({
    quizAccuracy: existing?.subscores.content,
    checklistCompletion: checklistCompletion ?? 0,
    equationDrillAccuracy: existing?.subscores.equations,
    carsScore: existing?.subscores.passage,
  });

  setDemoProgress(topicId, {
    topic_id: topicId,
    readiness_score,
    subscores,
    last_studied_at: new Date().toISOString(),
  });

  return NextResponse.json({ readiness_score, subscores });
}
