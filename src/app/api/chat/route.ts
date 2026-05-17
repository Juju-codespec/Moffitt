import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateTutorReply } from "@/lib/openai/tutor";
import { retrieveContextNotes } from "@/lib/rag/retrieval";
import type { Note } from "@/lib/types";
import type { McatSubjectId } from "@/lib/constants/subjects";

const chatSchema = z.object({
  user_id: z.string(),
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    })
  ),
  local_notes: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        subject: z.string(),
        topic: z.string(),
        tags: z.array(z.string()).optional(),
      })
    )
    .optional(),
  simplify: z.boolean().optional(),
  weak_subject: z.string().optional(),
});

/** POST /api/chat — AI tutor with RAG */
export async function POST(req: NextRequest) {
  try {
    const body = chatSchema.parse(await req.json());
    const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
    const query = lastUser?.content ?? "";

    const contextNotes = await retrieveContextNotes(
      body.user_id,
      query,
      (body.local_notes?.map((n) => ({
        ...n,
        user_id: body.user_id,
        subject: n.subject as McatSubjectId,
        uworld_section: "",
        difficulty: "medium" as const,
        tags: n.tags ?? [],
        created_at: "",
        updated_at: "",
      })) ?? []) as Note[]
    );

    const reply = await generateTutorReply(body.messages, contextNotes, {
      simplify: body.simplify,
      weakSubject: body.weak_subject,
    });

    return NextResponse.json({ reply, contextCount: contextNotes.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}
