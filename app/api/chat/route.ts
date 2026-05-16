import { openai } from "@ai-sdk/openai";
import { streamText, type CoreMessage } from "ai";
import { buildSectionSystemPrompt } from "@/lib/prompts";
import { getSection } from "@/lib/uworld-sections";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, sectionSlug } = body as {
      messages?: { role: string; content: string }[];
      sectionSlug?: string;
    };

    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        {
          error:
            "Missing OPENAI_API_KEY. Create .env.local with your key and restart the dev server.",
        },
        { status: 503 },
      );
    }

    if (!Array.isArray(messages) || !sectionSlug) {
      return Response.json({ error: "Invalid payload." }, { status: 400 });
    }

    const section = getSection(sectionSlug);
    if (!section) {
      return Response.json({ error: "Unknown section." }, { status: 400 });
    }

    const modelId = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

    const coreMessages = messages as CoreMessage[];

    const result = streamText({
      model: openai(modelId),
      system: buildSectionSystemPrompt(section),
      messages: coreMessages,
    });

    return result.toDataStreamResponse();
  } catch {
    return Response.json({ error: "Malformed JSON body." }, { status: 400 });
  }
}
