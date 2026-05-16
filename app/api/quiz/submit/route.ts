import { NextResponse } from "next/server";
import { getTopicById } from "@/lib/data/curriculum";
import { getDemoQuiz, setDemoProgress, addDemoError } from "@/lib/demo/store";
import { computeReadiness } from "@/lib/readiness/scoring";

export async function POST(req: Request) {
  const { quizId, answers, timeSpentSec } = await req.json();

  const quiz = getDemoQuiz(quizId);
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  const { questions, topic_id: topicId } = quiz;
  let correct = 0;

  questions.forEach((q, i) => {
    const userAnswer = answers[i];
    if (userAnswer === q.correctIndex) {
      correct++;
    } else if (userAnswer !== undefined && userAnswer !== null) {
      addDemoError({
        topic_id: topicId,
        concept: q.concept,
        user_mistake: `Selected: ${q.choices[userAnswer]}`,
        ai_correction: q.explanation,
      });
    }
  });

  const score = Math.round((correct / questions.length) * 100);
  const topic = getTopicById(topicId);

  const { readiness_score, subscores } = computeReadiness({
    quizAccuracy: score,
    equationDrillAccuracy: topic?.section_slug === "chem-phys" ? score : undefined,
    avgTimePerQuestionSec: timeSpentSec
      ? Math.round(timeSpentSec / questions.length)
      : undefined,
    targetTimePerQuestionSec: topic?.section_slug === "cars" ? 90 : 120,
  });

  setDemoProgress(topicId, {
    topic_id: topicId,
    readiness_score,
    subscores,
    last_studied_at: new Date().toISOString(),
  });

  return NextResponse.json({
    score,
    correct,
    total: questions.length,
    readiness_score,
    subscores,
  });
}
