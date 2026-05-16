import { NextResponse } from "next/server";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { getTopicById } from "@/lib/data/curriculum";
import { quizSchema } from "@/lib/ai/schemas";
import { saveDemoQuiz } from "@/lib/demo/store";
import { v4 as uuidv4 } from "uuid";
import type { QuizQuestion } from "@/types";

function fallbackQuestions(topicName: string): QuizQuestion[] {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `q-${i + 1}`,
    stem: `Original MCAT-style question ${i + 1} about ${topicName}: Which statement best applies the core principle?`,
    choices: [
      "Applies the principle correctly with MCAT logic",
      "True fact but irrelevant to the question",
      "Common trap: reverses cause and effect",
      "Extreme answer not supported by setup",
    ],
    correctIndex: 0,
    explanation:
      "Choice A follows the governing rule; B is a distraction; C is a typical trap; D uses unsupported extremes.",
    concept: topicName,
  }));
}

export async function POST(req: Request) {
  const { topicId, quizType = "mini", count = 5 } = await req.json();

  const topic = getTopicById(topicId);
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  let questions: QuizQuestion[] = fallbackQuestions(topic.name);

  if (isOpenAIConfigured()) {
    try {
      const completion = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `Generate ${count} ORIGINAL MCAT-style multiple choice questions (4 choices each) for ${topic.name}. Never copy UWorld/AAMC content. Return JSON: { questions: [{ id, stem, choices[4], correctIndex, explanation, concept }] }`,
          },
          { role: "user", content: `Quiz type: ${quizType}. Subtopics: ${(topic.subtopics ?? []).map((s) => s.name).join(", ")}` },
        ],
      });
      const parsed = quizSchema.parse(
        JSON.parse(completion.choices[0]?.message?.content ?? "{}")
      );
      questions = parsed.questions.slice(0, count);
    } catch {
      questions = fallbackQuestions(topic.name);
    }
  }

  const quizId = uuidv4();
  saveDemoQuiz(quizId, questions, topicId);

  return NextResponse.json({ quizId, questions });
}
