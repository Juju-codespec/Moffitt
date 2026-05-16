import { NextResponse } from "next/server";
import { getTopicById } from "@/lib/data/curriculum";
import { generateBriefing } from "@/lib/briefing/generate";
import { getCurrentUserId } from "@/lib/auth/user";
import {
  getDemoBriefing,
  setDemoBriefing,
} from "@/lib/demo/store";
import { isDemoMode } from "@/lib/demo/store";
import type { BriefingMode } from "@/types";

export async function POST(req: Request) {
  const body = await req.json();
  const { topicId, mode = "full" } = body as {
    topicId: string;
    mode?: BriefingMode;
  };

  if (!topicId) {
    return NextResponse.json({ error: "topicId required" }, { status: 400 });
  }

  const topic = getTopicById(topicId);
  if (!topic) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const userId = await getCurrentUserId();
  const cacheKey = `${userId}-${topicId}-${mode}`;

  if (isDemoMode()) {
    const cached = getDemoBriefing(cacheKey);
    if (cached) return NextResponse.json({ briefing: cached, cached: true });
  }

  const briefing = await generateBriefing(topic, mode);
  setDemoBriefing(cacheKey, briefing);

  return NextResponse.json({ briefing, cached: false });
}
