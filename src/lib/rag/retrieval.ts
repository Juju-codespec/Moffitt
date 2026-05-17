import type { Note } from "@/lib/types";
import { searchNotesByEmbedding } from "@/lib/services/notes-service";
import type { TutorContextNote } from "@/lib/openai/tutor";

/** Retrieve relevant notes for RAG — vector search with keyword fallback */
export async function retrieveContextNotes(
  userId: string,
  query: string,
  localNotes: Note[] = []
): Promise<TutorContextNote[]> {
  const vectorResults = await searchNotesByEmbedding(userId, query, 5);

  if (vectorResults.length > 0) {
    return vectorResults.map((n) => ({
      title: n.title,
      content: n.content,
      subject: n.subject,
      topic: n.topic,
    }));
  }

  // Keyword fallback for local/demo mode
  const q = query.toLowerCase();
  const scored = localNotes
    .map((n) => {
      const text = `${n.title} ${n.content} ${n.topic} ${n.tags.join(" ")}`.toLowerCase();
      let score = 0;
      for (const word of q.split(/\s+/).filter((w) => w.length > 2)) {
        if (text.includes(word)) score += 1;
      }
      return { note: n, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(({ note }) => ({
    title: note.title,
    content: note.content,
    subject: note.subject,
    topic: note.topic,
  }));
}
