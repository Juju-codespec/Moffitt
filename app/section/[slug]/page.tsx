import Link from "next/link";
import { notFound } from "next/navigation";
import { PrimerPanel } from "@/components/PrimerPanel";
import { TutorChat } from "@/components/TutorChat";
import { getSection, isSectionSlug } from "@/lib/uworld-sections";

type Props = { params: Promise<{ slug: string }> };

export default async function SectionPage({ params }: Props) {
  const { slug } = await params;
  if (!isSectionSlug(slug)) notFound();

  const section = getSection(slug);
  if (!section) notFound();

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12 lg:py-16">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            ← All sections
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            {section.shortTitle}
          </p>
          <h1 className="text-balance text-3xl font-semibold text-white md:text-4xl">
            {section.title}
          </h1>
          <p className="max-w-3xl text-base leading-relaxed text-slate-400">
            {section.description}
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-300 lg:max-w-sm">
          <p className="font-semibold text-white">Before you start blocks</p>
          <p className="mt-2 leading-relaxed text-slate-400">
            Skim the readiness checks, run one clustering pass (how concepts hook together),
            then use the chat to stress-test weak spots with drills—not trivia dumps.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        <PrimerPanel section={section} />
        <TutorChat sectionSlug={section.slug} sectionShortTitle={section.shortTitle} />
      </div>
    </main>
  );
}
