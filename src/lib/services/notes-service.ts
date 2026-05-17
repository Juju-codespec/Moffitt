import type { Note } from "@/lib/types";
import type { McatSubjectId, DifficultyLevel } from "@/lib/constants/subjects";
import { embedText } from "@/lib/openai/embeddings";
import { createServerSupabase } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

export interface CreateNoteInput {
  user_id: string;
  title: string;
  content: string;
  subject: McatSubjectId;
  topic: string;
  uworld_section: string;
  difficulty: DifficultyLevel;
  tags?: string[];
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Create or update note with optional embedding */
export async function saveNote(
  input: CreateNoteInput & { id?: string }
): Promise<Note> {
  const now = new Date().toISOString();
  const embedding = await embedText(`${input.title}\n${input.content}`);

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    const row = {
      user_id: input.user_id,
      title: input.title,
      content: input.content,
      subject: input.subject,
      topic: input.topic,
      uworld_section: input.uworld_section,
      difficulty: input.difficulty,
      tags: input.tags ?? [],
      embedding,
      updated_at: now,
    };

    if (input.id) {
      const { data, error } = await supabase
        .from("notes")
        .update(row as never)
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    }

    const { data, error } = await supabase
      .from("notes")
      .insert({ ...row, id: uuidv4() } as never)
      .select()
      .single();
    if (error) throw error;
    return data as Note;
  }

  // Fallback handled on client via API returning note shape
  return {
    id: input.id ?? uuidv4(),
    ...input,
    tags: input.tags ?? [],
    created_at: now,
    updated_at: now,
    embedding: embedding ?? undefined,
  };
}

/** List notes for user */
export async function listNotes(userId: string): Promise<Note[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createServerSupabase();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Note[];
}

/** Vector similarity search via Supabase RPC */
export async function searchNotesByEmbedding(
  userId: string,
  query: string,
  limit = 5
): Promise<Pick<Note, "id" | "title" | "content" | "subject" | "topic">[]> {
  const embedding = await embedText(query);
  if (!embedding || !isSupabaseConfigured()) return [];

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.rpc(
    "match_notes",
    {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: limit,
      filter_user_id: userId,
    } as never
  );

  if (error) {
    console.error("match_notes error:", error);
    return [];
  }
  return data ?? [];
}
