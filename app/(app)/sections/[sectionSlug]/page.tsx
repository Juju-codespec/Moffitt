import { notFound } from "next/navigation";
import Link from "next/link";
import { getSectionBySlug, getTopicsBySection } from "@/lib/data/curriculum";
import { TopicCard } from "@/components/sections/topic-card";
import { ConceptTree } from "@/components/sections/concept-tree";
import type { McatSectionSlug } from "@/types";

const VALID: McatSectionSlug[] = [
  "chem-phys",
  "cars",
  "bio-biochem",
  "psych-soc",
];

export default async function SectionPage({
  params,
}: {
  params: Promise<{ sectionSlug: string }>;
}) {
  const { sectionSlug } = await params;
  if (!VALID.includes(sectionSlug as McatSectionSlug)) notFound();

  const section = getSectionBySlug(sectionSlug as McatSectionSlug);
  const topics = getTopicsBySection(sectionSlug as McatSectionSlug);
  if (!section) notFound();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-2 flex flex-wrap gap-2 text-sm text-zinc-500">
        <Link href="/dashboard" className="hover:text-zinc-300">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-zinc-300">{section.name}</span>
      </div>
      <h1 className="text-2xl font-bold text-zinc-50">{section.name}</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        UWorld-style topic categories with high-yield subtopics, traps, and
        pre-QBank briefings.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            {topics.map((t) => (
              <TopicCard
                key={t.id}
                topic={t}
                sectionSlug={sectionSlug}
                readiness={35}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-medium text-zinc-400">Concept tree</h2>
          <ConceptTree topics={topics} />
        </div>
      </div>
    </div>
  );
}
