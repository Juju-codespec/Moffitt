"use client";

import { useState, useEffect } from "react";
import { QuizRunner } from "@/components/quiz/QuizRunner";
import { FlashcardView } from "@/components/ui/FlashcardView";
import { GlassCard } from "@/components/ui/GlassCard";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localNotesStore } from "@/lib/storage/local-notes";
import type { Note } from "@/lib/types";

export default function QuizPage() {
  const [concept, setConcept] = useState("Bernoulli Principle");
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    setNotes(localNotesStore.list(getDemoUserId()));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Quiz Mode</h1>
        <p className="text-sm text-slate-500">
          Easy, medium, and MCAT-style questions with explanations.
        </p>
      </div>

      <GlassCard>
        <label className="mb-2 block text-xs text-slate-500">Concept or note</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
          <select
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
            onChange={(e) => {
              const n = notes.find((x) => x.id === e.target.value);
              setSelectedNote(n ?? null);
              if (n) setConcept(n.title);
            }}
          >
            <option value="">From note...</option>
            {notes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.title}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      <QuizRunner
        concept={concept}
        subject={selectedNote?.subject}
        noteContent={selectedNote?.content}
      />

      <FlashcardView
        front={concept}
        back={selectedNote?.content?.slice(0, 300) ?? "Generate a quiz to load the answer side from AI explanations."}
      />
    </div>
  );
}
