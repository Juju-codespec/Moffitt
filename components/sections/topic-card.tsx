import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReadinessRing } from "@/components/dashboard/readiness-ring";
import type { McatTopic } from "@/types";
import { ArrowRight } from "lucide-react";

export function TopicCard({
  topic,
  sectionSlug,
  readiness = 0,
}: {
  topic: McatTopic;
  sectionSlug: string;
  readiness?: number;
}) {
  return (
    <Card className="group transition-all hover:border-emerald-500/30 hover:bg-zinc-900/60">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base">{topic.name}</CardTitle>
          <p className="mt-1 text-xs text-zinc-500">
            {(topic.subtopics ?? []).filter((s) => s.high_yield).length} high-yield
            subtopics
          </p>
        </div>
        <ReadinessRing value={readiness} size={48} />
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex flex-wrap gap-1">
          {(topic.subtopics ?? []).slice(0, 3).map((s) => (
            <Badge key={s.name} variant={s.high_yield ? "default" : "secondary"}>
              {s.name}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/before-you-start/${topic.id}?mode=full`}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-500"
          >
            Before You Start
          </Link>
          <Link
            href={`/sections/${sectionSlug}/topics/${topic.slug}`}
            className="flex items-center gap-1 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
