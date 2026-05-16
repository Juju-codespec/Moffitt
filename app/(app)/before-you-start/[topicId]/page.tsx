"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getTopicById } from "@/lib/data/curriculum";
import { BriefingView } from "@/components/briefing/briefing-view";
import { Button } from "@/components/ui/button";
import type { BeforeYouStartBriefing, BriefingMode } from "@/types";
import { Loader2 } from "lucide-react";

export default function BeforeYouStartPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const [topicId, setTopicId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") ?? "full") as BriefingMode;

  const [briefing, setBriefing] = useState<BeforeYouStartBriefing | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setTopicId(p.topicId));
  }, [params]);

  useEffect(() => {
    if (!topicId) return;
    setLoading(true);
    fetch("/api/briefing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, mode }),
    })
      .then((r) => r.json())
      .then((d) => setBriefing(d.briefing))
      .finally(() => setLoading(false));
  }, [topicId, mode]);

  const topic = topicId ? getTopicById(topicId) : undefined;

  if (!topicId || !topic) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href={`/sections/${topic.section_slug}/topics/${topic.slug}`}
            className="text-sm text-zinc-500 hover:text-zinc-300"
          >
            ← Back to {topic.name}
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Before You Start</h1>
          <p className="text-sm text-zinc-400">
            Mode: {mode.replace("_", " ")} · {topic.name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/before-you-start/${topicId}?mode=full`}>
            <Button variant={mode === "full" ? "default" : "outline"} size="sm">
              Full
            </Button>
          </Link>
          <Link href={`/before-you-start/${topicId}?mode=high_yield`}>
            <Button
              variant={mode === "high_yield" ? "default" : "outline"}
              size="sm"
            >
              High-Yield
            </Button>
          </Link>
          <Link href={`/before-you-start/${topicId}?mode=cram`}>
            <Button variant={mode === "cram" ? "default" : "outline"} size="sm">
              Cram
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
        </div>
      ) : briefing ? (
        <BriefingView briefing={briefing} topicId={topicId} />
      ) : (
        <p className="text-zinc-400">Failed to load briefing.</p>
      )}
    </div>
  );
}
