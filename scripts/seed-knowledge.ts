/**
 * Seed knowledge chunks into Supabase with embeddings.
 * Usage: npx tsx scripts/seed-knowledge.ts
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const CHUNKS_DIR = path.join(process.cwd(), "content/knowledge-chunks");

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!url || !key || !openaiKey) {
    console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const openai = new OpenAI({ apiKey: openaiKey });

  const sections = fs.readdirSync(CHUNKS_DIR);
  for (const sectionSlug of sections) {
    const sectionPath = path.join(CHUNKS_DIR, sectionSlug);
    if (!fs.statSync(sectionPath).isDirectory()) continue;

    for (const file of fs.readdirSync(sectionPath).filter((f) => f.endsWith(".md"))) {
      const topicSlug = file.replace(/\.md$/, "");
      const content = fs.readFileSync(path.join(sectionPath, file), "utf-8");
      const title = `${sectionSlug}/${topicSlug}`;

      const { data: doc } = await supabase
        .from("knowledge_documents")
        .upsert(
          {
            section_slug: sectionSlug,
            topic_slug: topicSlug,
            doc_type: "concept",
            title,
            source_path: `content/knowledge-chunks/${sectionSlug}/${file}`,
          },
          { onConflict: "section_slug,topic_slug" }
        )
        .select()
        .single();

      const embRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: content,
      });

      await supabase.from("knowledge_chunks").insert({
        document_id: doc?.id,
        content,
        embedding: embRes.data[0].embedding,
        metadata: { section_slug: sectionSlug, topic_slug: topicSlug },
      });

      console.log(`Seeded ${title}`);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
