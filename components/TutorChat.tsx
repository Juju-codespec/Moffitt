"use client";

import { useChat } from "ai/react";
import { FormEvent, useMemo } from "react";
import type { SectionSlug } from "@/lib/uworld-sections";

const STARTERS: Record<
  SectionSlug,
  { label: string; prompt: string }[]
> = {
  "chem-phys": [
    {
      label: "Unit sanity pass",
      prompt:
        "Give me a 10-minute warm-up: dimensional analysis drills + one worked example that mixes fluids and electrochemistry intuition.",
    },
    {
      label: "Graph-first heuristic",
      prompt:
        "Teach me how to attack unfamiliar graphs in Chem/Phys passages before reading every word. Include a checklist.",
    },
    {
      label: "OChem mechanism pattern",
      prompt:
        "Walk me through how to classify nucleophilic substitution vs elimination scenarios quickly under timed pressure.",
    },
  ],
  cars: [
    {
      label: "Passage map",
      prompt:
        "Give me a repeatable 90-second passage mapping routine for CARS. Include what to write in the margins.",
    },
    {
      label: "Strengthen/weaken",
      prompt:
        "Explain how to strengthen or weaken an author's argument using only passage evidence. Use a micro-example.",
    },
    {
      label: "Trap spotting",
      prompt:
        "List the top five CARS distractor patterns I should audit after each missed question.",
    },
  ],
  "bio-biochem": [
    {
      label: "Pathway logic",
      prompt:
        "Help me rehearse high-yield metabolic regulation using cause→effect chains (no flashcard spam).",
    },
    {
      label: "Figure drill",
      prompt:
        "Coach me on reading physiology figures (pressure/volume, transport curves) before I read the passage.",
    },
    {
      label: "Experiment parsing",
      prompt:
        "Teach me how to extract variables and controls from Bio/Biochem experiment passages quickly.",
    },
  ],
  "psych-soc": [
    {
      label: "Construct discrimination",
      prompt:
        "Quiz me briefly on pairs of easily confused Psych/Soc constructs. Ask one question at a time.",
    },
    {
      label: "Study design audit",
      prompt:
        "Give me a checklist to evaluate internal validity threats in research-heavy passages.",
    },
    {
      label: "Stats intuition",
      prompt:
        "Explain when mean vs median wins, and how skew/outliers should change my interpretation on the MCAT.",
    },
  ],
};

type Props = {
  sectionSlug: SectionSlug;
  sectionShortTitle: string;
};

export function TutorChat({ sectionSlug, sectionShortTitle }: Props) {
  const starters = useMemo(() => STARTERS[sectionSlug], [sectionSlug]);

  const { messages, input, handleInputChange, handleSubmit, status, error, append } =
    useChat({
      api: "/api/chat",
      body: { sectionSlug },
    });

  const busy = status === "submitted" || status === "streaming";

  function onPickStarter(prompt: string) {
    void append({ role: "user", content: prompt });
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    void handleSubmit(e);
  }

  return (
    <aside className="flex h-[min(760px,calc(100vh-8rem))] flex-col gap-4 rounded-2xl border border-white/10 bg-[var(--surface)] p-5 shadow-[0_18px_70px_-35px_rgba(2,6,23,0.9)] lg:sticky lg:top-10">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          AI tutor · {sectionShortTitle}
        </p>
        <h2 className="text-lg font-semibold text-white">Sharpen reasoning pre-blocks</h2>
        <p className="text-sm leading-relaxed text-slate-400">
          Ask for drills, explain-back prompts, or targeted weak-point review. This coach is
          scoped to your selected section&apos;s typical traps.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error.message.includes("503") || error.message.toLowerCase().includes("api key")
            ? "Add OPENAI_API_KEY to .env.local (server-side) and restart dev."
            : error.message}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {starters.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => onPickStarter(s.prompt)}
            disabled={busy}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-cyan-400/40 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-white/10 bg-black/25 p-4">
        {messages.length === 0 && (
          <p className="text-sm text-slate-500">
            No messages yet—tap a starter or write your own primer question.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {m.role === "user" ? "You" : "Tutor"}
            </p>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
              {m.content}
            </div>
          </div>
        ))}
        {busy && (
          <p className="text-xs text-slate-500">
            Tutor is thinking<span className="animate-pulse">…</span>
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Your question
        </label>
        <textarea
          value={input}
          onChange={handleInputChange}
          rows={3}
          placeholder="Example: Teach me how to sanity-check equilibrium reasoning when numbers look messy."
          className="w-full resize-none rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white outline-none ring-cyan-400/0 transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/20"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_45px_-25px_rgba(56,189,248,0.9)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </aside>
  );
}
