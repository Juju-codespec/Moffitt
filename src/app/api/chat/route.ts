import { buildSystemPrompt, buildTopicContext } from "@/lib/prompts";
import { streamChat, type ChatMessage } from "@/lib/llm";
import { getSection, type SectionId } from "@/lib/sections";

export const runtime = "nodejs";

interface ChatRequestBody {
  sectionId: SectionId;
  topicId?: string | null;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
}

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const section = getSection(body.sectionId);
  if (!section) {
    return Response.json({ error: "Unknown section" }, { status: 400 });
  }

  if (!body.messages?.length) {
    return Response.json({ error: "No messages provided" }, { status: 400 });
  }

  const systemContent =
    buildSystemPrompt(section) +
    buildTopicContext(section, body.topicId ?? null);

  const llmMessages: ChatMessage[] = [
    { role: "system", content: systemContent },
    ...body.messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamChat(llmMessages, (chunk) => {
          controller.enqueue(encoder.encode(chunk));
        });
        controller.close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Stream failed";
        controller.enqueue(encoder.encode(`\n\n[Error: ${msg}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
