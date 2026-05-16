import type { UWorldSection } from "@/lib/uworld-sections";

export function PrimerPanel({ section }: { section: UWorldSection }) {
  return (
    <section className="space-y-8">
      <div className="rounded-2xl border border-white/10 bg-[var(--surface)] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Block preview
        </p>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
          {section.blockPreview.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-5">
        {section.subtopics.map((st) => (
          <article
            key={st.id}
            className="rounded-2xl border border-white/10 bg-[var(--surface-2)]/90 p-6 shadow-[0_18px_70px_-45px_rgba(15,23,42,1)]"
          >
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                UWorld-style lane
              </p>
              <h3 className="text-xl font-semibold text-white">{st.title}</h3>
            </header>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/90">
                  Readiness checks
                </p>
                <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                  {st.readinessChecks.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-400/80" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300/90">
                  Concept clusters
                </p>
                <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                  {st.conceptClusters.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-cyan-400/80" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300/90">
                  Common traps
                </p>
                <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
                  {st.commonTraps.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-amber-400/80" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
