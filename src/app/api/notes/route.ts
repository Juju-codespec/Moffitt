import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { saveNote, listNotes } from "@/lib/services/notes-service";
import {
  MCAT_SUBJECTS,
  DIFFICULTY_LEVELS,
  type McatSubjectId,
} from "@/lib/constants/subjects";

const subjectIds = MCAT_SUBJECTS.map((s) => s.id) as [McatSubjectId, ...McatSubjectId[]];

const createSchema = z.object({
  user_id: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
  subject: z.enum(subjectIds),
  topic: z.string().default(""),
  uworld_section: z.string().default(""),
  difficulty: z.enum(DIFFICULTY_LEVELS).default("medium"),
  tags: z.array(z.string()).optional(),
  id: z.string().optional(),
});

/** GET /api/notes?user_id= — list notes */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id");
  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }
  try {
    const notes = await listNotes(userId);
    return NextResponse.json({ notes });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ notes: [] });
  }
}

/** POST /api/notes — create or update note */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.parse(body);
    const note = await saveNote(parsed);
    return NextResponse.json({ note });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.flatten() }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Failed to save note" }, { status: 500 });
  }
}
