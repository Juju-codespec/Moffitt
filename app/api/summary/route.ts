import { NextResponse } from "next/server";
import { getOpenAI, isOpenAIConfigured } from "@/lib/openai";
import { addDemoStudyMinutes } from "@/lib/demo/store";

export async function POST(req: Request) {
  const { durationMinutes, topicsStudied, highlights } = await req.json();

  addDemoStudyMinutes(durationMinutes ?? 0);

  if (!isOpenAIConfigured()) {
    return NextResponse.json({
      summary: `Session complete: ${durationMinutes ?? 0} minutes on ${(topicsStudied ?? []).join(", ") || "general review"}. Keep building streak momentum.`,
    });
  }

  const completion = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Write a brief, motivating MCAT study session summary (3-4 bullets). Original content only.",
      },
      {
        role: "user",
        content: JSON.stringify({ durationMinutes, topicsStudied, highlights }),
      },
    ],
  });

  return NextResponse.json({
    summary: completion.choices[0]?.message?.content,
  });
}
