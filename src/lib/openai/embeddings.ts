import { getOpenAI } from "./client";

const EMBEDDING_MODEL = "text-embedding-3-small";

/** Generate embedding vector for RAG retrieval */
export async function embedText(text: string): Promise<number[] | null> {
  const openai = getOpenAI();
  if (!openai) return null;
  const input = text.slice(0, 8000);
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
  });
  return res.data[0]?.embedding ?? null;
}
