import { HealthBadge } from "@/components/HealthBadge";
import { OllamaSetup } from "@/components/OllamaSetup";
import { SectionCard } from "@/components/SectionCard";
import { SECTION_LIST } from "@/lib/sections";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-grid">
      <header className="border-b border-surface-border/80 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Moffitt
            </h1>
            <p className="text-sm text-slate-400">
              Pre-QBank MCAT tutor · by UWorld section
            </p>
          </div>
          <HealthBadge />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-10 text-center">
          <h2 className="text-balance text-3xl font-semibold text-white sm:text-4xl">
            Master concepts before you open QBank
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Pick your UWorld section. Study foundational topics, then chat with a
            tutor tuned for C/P, B/B, P/S, or CARS—running locally on your machine
            via Ollama.
          </p>
        </section>

        <OllamaSetup />

        <div className="grid gap-5 sm:grid-cols-2">
          {SECTION_LIST.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        <section className="mt-12 rounded-2xl border border-surface-border bg-surface-raised p-6">
          <h3 className="mb-2 font-semibold text-white">Local setup</h3>
          <ol className="list-inside list-decimal space-y-1 text-sm text-slate-400">
            <li>
              Install{" "}
              <a
                href="https://ollama.com"
                className="text-sky-400 underline"
                target="_blank"
                rel="noreferrer"
              >
                Ollama
              </a>{" "}
              and run{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs text-slate-300">
                ollama pull llama3.2
              </code>
            </li>
            <li>
              Copy{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                .env.example
              </code>{" "}
              to{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                .env
              </code>
            </li>
            <li>
              Run{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                npm install && npm run dev
              </code>{" "}
              → open{" "}
              <code className="rounded bg-surface px-1.5 py-0.5 font-mono text-xs">
                http://localhost:3000
              </code>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
