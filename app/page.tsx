import Link from "next/link";
import { UWORLD_SECTIONS } from "@/lib/uworld-sections";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-16">
      <header className="space-y-5">
        <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-300">
          Pre-QBank primer + AI coach
        </p>
        <div className="space-y-4">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Train by section. Enter QBanks with a game plan.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-400">
            Pick the lane that matches your UWorld split—Chem/Phys, CARS, Bio/Biochem,
            or Psych/Soc—review the readiness checklist, then chat with a tutor tuned to
            that domain&apos;s traps and reasoning moves.
          </p>
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {UWORLD_SECTIONS.map((section) => (
          <Link
            key={section.slug}
            href={`/section/${section.slug}`}
            className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${section.accent} p-6 shadow-[0_20px_70px_-35px_rgba(15,23,42,0.85)] ring-1 ring-inset transition hover:border-white/20 hover:shadow-[0_24px_90px_-40px_rgba(56,189,248,0.35)]`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  {section.shortTitle}
                </p>
                <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                <p className="text-sm leading-relaxed text-slate-300">{section.tagline}</p>
              </div>
              <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs font-medium text-slate-200 transition group-hover:border-white/25">
                Open primer →
              </span>
            </div>
            <ul className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm text-slate-300">
              {section.blockPreview.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </section>

      <footer className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-relaxed text-slate-400">
        <p>
          The AI tutor uses your OpenAI API key when configured (
          <code className="rounded bg-black/40 px-2 py-0.5 font-[family-name:var(--font-jetbrains)] text-xs text-slate-200">
            OPENAI_API_KEY
          </code>
          ). It does not include proprietary question material—bring your own misses and
          passages when you debrief.
        </p>
      </footer>
    </main>
  );
}
