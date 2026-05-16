import { notFound } from "next/navigation";
import Link from "next/link";
import { getSectionBySlug, getTopicBySlug } from "@/lib/data/curriculum";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { McatSectionSlug } from "@/types";

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ sectionSlug: string; topicSlug: string }>;
}) {
  const { sectionSlug, topicSlug } = await params;
  const topic = getTopicBySlug(sectionSlug as McatSectionSlug, topicSlug);
  const section = getSectionBySlug(sectionSlug as McatSectionSlug);
  if (!topic || !section) notFound();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <Link
          href={`/sections/${sectionSlug}`}
          className="text-sm text-zinc-500 hover:text-zinc-300"
        >
          ← {section.name}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{topic.name}</h1>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link href={`/before-you-start/${topic.id}?mode=full`}>
          <Button>Before You Start — Full</Button>
        </Link>
        <Link href={`/before-you-start/${topic.id}?mode=high_yield`}>
          <Button variant="secondary">High-Yield Only</Button>
        </Link>
        <Link href={`/before-you-start/${topic.id}?mode=cram`}>
          <Button variant="outline">Cram Mode</Button>
        </Link>
        <Link href={`/tutor?topicId=${topic.id}`}>
          <Button variant="ghost">Open AI Tutor</Button>
        </Link>
      </div>

      <section className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-zinc-400">High-yield subtopics</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(topic.subtopics ?? []).map((s) => (
              <Badge key={s.name} variant={s.high_yield ? "default" : "secondary"}>
                {s.name}
              </Badge>
            ))}
          </div>
        </div>

        {topic.metadata.equations?.length ? (
          <div>
            <h2 className="text-sm font-medium text-zinc-400">Key equations</h2>
            <ul className="mt-2 space-y-1 font-mono text-sm text-emerald-400/90">
              {topic.metadata.equations.map((eq) => (
                <li key={eq}>{eq}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {topic.metadata.trap_patterns?.length ? (
          <div>
            <h2 className="text-sm font-medium text-zinc-400">Common traps</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">
              {topic.metadata.trap_patterns.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
