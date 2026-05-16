"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Section } from "@/lib/sections";
import { buildPreQbankBriefingPrompt } from "@/lib/prompts";
import { TutorChat } from "@/components/TutorChat";

const accentText: Record<Section["color"], string> = {
  cp: "text-accent-cp",
  bb: "text-accent-bb",
  ps: "text-accent-ps",
  cars: "text-accent-cars",
};

const accentRing: Record<Section["color"], string> = {
  cp: "ring-accent-cp/50 border-accent-cp/40",
  bb: "ring-accent-bb/50 border-accent-bb/40",
  ps: "ring-accent-ps/50 border-accent-ps/40",
  cars: "ring-accent-cars/50 border-accent-cars/40",
};

export function SectionWorkspace({ section }: { section: Section }) {
  const [topicId, setTopicId] = useState<string | null>(
    section.topics[0]?.id ?? null
  );
  const [briefingRequest, setBriefingRequest] = useState<string | null>(null);

  const activeTopic = section.topics.find((t) => t.id === topicId);

  const requestBriefing = useCallback(() => {
    if (!topicId) return;
    const prompt = buildPreQbankBriefingPrompt(section, topicId);
    if (prompt) setBriefingRequest(prompt);
  }, [section, topicId]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-slate-500 hover:text-white"
      >
        ← All sections
      </Link>

      <div className="mb-8">
        <span
          className={`text-sm font-semibold uppercase tracking-wide ${accentText[section.color]}`}
        >
          {section.uworldLabel}
        </span>
        <h1 className="mt-1 text-3xl font-bold text-white">{section.name}</h1>
        <p className="mt-2 max-w-3xl text-slate-400">{section.preQbankGoal}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
        <aside className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Pre-QBank topics
          </h2>
          <ul className="space-y-2">
            {section.topics.map((topic) => {
              const active = topic.id === topicId;
              return (
                <li key={topic.id}>
                  <button
                    type="button"
                    onClick={() => setTopicId(topic.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      active
                        ? `bg-surface-raised ring-1 ${accentRing[section.color]}`
                        : "border-surface-border bg-surface-raised/50 hover:border-slate-600"
                    }`}
                  >
                    <span className="font-medium text-white">{topic.title}</span>
                    <p className="mt-1 text-xs leading-relaxed text-slate-400">
                      {topic.summary}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {activeTopic && (
            <button
              type="button"
              onClick={requestBriefing}
              className={`w-full rounded-xl border bg-surface-raised px-4 py-3 text-sm font-medium text-white transition hover:bg-surface ${accentRing[section.color]}`}
            >
              Start Pre-QBank briefing
            </button>
          )}

          {activeTopic && (
            <div className="rounded-xl border border-surface-border bg-surface p-4">
              <h3 className="mb-2 text-xs font-medium uppercase text-slate-500">
                QBank readiness
              </h3>
              <ul className="space-y-1.5">
                {activeTopic.qbankReadiness.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-xs text-slate-300"
                  >
                    <span className={accentText[section.color]}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500">
            Tutor
          </h2>
          <TutorChat
            section={section}
            topicId={topicId}
            starterPrompts={section.starterPrompts}
            autoSendPrompt={briefingRequest}
            onAutoSendComplete={() => setBriefingRequest(null)}
          />
        </div>
      </div>
    </div>
  );
}
