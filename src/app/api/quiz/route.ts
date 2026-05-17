import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI } from "@/lib/openai/client";

const quizSchema = z.object({
  concept: z.string().min(1),
  subject: z.string().optional(),
  note_content: z.string().optional(),
});

/** POST /api/quiz — generate 3-tier mini quiz */
export async function POST(req: NextRequest) {
  try {
    const { concept, subject, note_content } = quizSchema.parse(await req.json());
    const openai = getOpenAI();

    if (!openai) {
      return NextResponse.json({
        quizzes: getMockQuizzes(concept),
      });
    }

    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Generate exactly 3 MCAT quiz questions as JSON array:
[{ "difficulty": "easy"|"medium"|"mcat", "question": "...", "options": ["A","B","C","D"], "correctIndex": 0-3, "explanation": "..." }]
For "mcat" include a short passage. Concept: ${concept}. Subject: ${subject ?? "general"}.
${note_content ? `Student notes: ${note_content.slice(0, 2000)}` : ""}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const raw = res.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as { quizzes?: unknown[] };
    const quizzes = parsed.quizzes ?? (Array.isArray(parsed) ? parsed : getMockQuizzes(concept));
    return NextResponse.json({ quizzes });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Quiz generation failed" }, { status: 500 });
  }
}

function getMockQuizzes(concept: string) {
  return [
    {
      difficulty: "easy",
      question: `What is the core idea behind ${concept}?`,
      options: [
        "A fundamental relationship tested on the MCAT",
        "Only relevant for Step 1",
        "Never appears on practice exams",
        "Unrelated to problem-solving",
      ],
      correctIndex: 0,
      explanation: `${concept} is high-yield MCAT content.`,
    },
    {
      difficulty: "medium",
      question: `Which scenario best applies ${concept}?`,
      options: [
        "Clinical residency management",
        "MCAT passage reasoning",
        "Hospital billing codes",
        "Electronic health records only",
      ],
      correctIndex: 1,
      explanation: "MCAT tests application, not clinical management.",
    },
    {
      difficulty: "mcat",
      question: `Passage: A student reviews UWorld missed questions on ${concept}. Which study approach maximizes retention?`,
      options: [
        "Passive re-read only",
        "Capture notes + active recall within 24h",
        "Skip explanations",
        "Wait until 1 week before exam",
      ],
      correctIndex: 1,
      explanation: "Spaced active recall is evidence-based for retention.",
    },
  ];
}
