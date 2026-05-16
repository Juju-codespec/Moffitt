import fs from "fs";
import path from "path";
import { embedText, isOpenAIConfigured } from "@/lib/openai";
import { createServiceClient } from "@/lib/supabase/server";
import type { McatSectionSlug } from "@/types";

const CHUNKS_DIR = path.join(process.cwd(), "content/knowledge-chunks");

interface LocalChunk {
  id: string;
  content: string;
  section_slug: string;
  topic_slug: string;
  metadata: Record<string, unknown>;
}

let localChunksCache: LocalChunk[] | null = null;

function loadLocalChunks(): LocalChunk[] {
  if (localChunksCache) return localChunksCache;
  const chunks: LocalChunk[] = [];
  if (!fs.existsSync(CHUNKS_DIR)) {
    localChunksCache = chunks;
    return chunks;
  }

  const sections = fs.readdirSync(CHUNKS_DIR);
  for (const sectionSlug of sections) {
    const sectionPath = path.join(CHUNKS_DIR, sectionSlug);
    if (!fs.statSync(sectionPath).isDirectory()) continue;
    const files = fs.readdirSync(sectionPath).filter((f) => f.endsWith(".md"));
    for (const file of files) {
      const topicSlug = file.replace(/\.md$/, "");
      const content = fs.readFileSync(path.join(sectionPath, file), "utf-8");
      chunks.push({
        id: `${sectionSlug}-${topicSlug}`,
        content,
        section_slug: sectionSlug,
        topic_slug: topicSlug,
        metadata: { source: file },
      });
    }
  }
  localChunksCache = chunks;
  return chunks;
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8);
}

async function retrieveLocal(
  query: string,
  section?: string,
  topic?: string,
  topK = 8
) {
  const chunks = loadLocalChunks().filter((c) => {
    if (section && c.section_slug !== section) return false;
    if (topic && c.topic_slug !== topic) return false;
    return true;
  });

  if (!isOpenAIConfigured() || chunks.length === 0) {
    return chunks.slice(0, topK);
  }

  const queryEmb = await embedText(query);
  const scored = await Promise.all(
    chunks.map(async (c) => {
      const emb = await embedText(c.content.slice(0, 2000));
      return { chunk: c, score: cosineSimilarity(queryEmb, emb) };
    })
  );
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}

export async function retrieveContext(options: {
  query: string;
  section?: McatSectionSlug;
  topic?: string;
  topK?: number;
}) {
  const { query, section, topic, topK = 8 } = options;

  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    isOpenAIConfigured()
  ) {
    try {
      const supabase = await createServiceClient();
      const embedding = await embedText(query);
      const { data, error } = await supabase.rpc("match_knowledge_chunks", {
        query_embedding: embedding,
        match_threshold: 0.5,
        match_count: topK,
        filter_section: section ?? null,
        filter_topic: topic ?? null,
      });
      if (!error && data?.length) {
        return formatChunks(
          data.map(
            (d: { content: string; metadata?: Record<string, unknown> }) => ({
              content: d.content,
              metadata: d.metadata,
            })
          )
        );
      }
    } catch {
      // fall through to local
    }
  }

  const local = await retrieveLocal(query, section, topic, topK);
  return formatChunks(local.map((c) => ({ content: c.content, metadata: c.metadata })));
}

function formatChunks(
  chunks: { content: string; metadata?: Record<string, unknown> }[]
) {
  if (!chunks.length) return "";
  return chunks
    .map(
      (c, i) =>
        `[Chunk ${i + 1}]\n${c.content}\n${c.metadata ? `Meta: ${JSON.stringify(c.metadata)}` : ""}`
    )
    .join("\n\n---\n\n");
}
