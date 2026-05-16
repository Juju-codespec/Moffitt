import { checkLlmHealth } from "@/lib/llm";

export const runtime = "nodejs";

export async function GET() {
  const health = await checkLlmHealth();
  return Response.json(health);
}
