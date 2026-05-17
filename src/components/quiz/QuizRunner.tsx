"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localQuizStore } from "@/lib/storage/local-notes";
import { recordForgottenConcept } from "@/components/dashboard/DailyReviewQueue";
import { v4 as uuidv4 } from "uuid";

interface QuizItem {
  difficulty: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function QuizRunner({
  concept,
  subject,
  noteContent,
}: {
  concept: string;
  subject?: string;
  noteContent?: string;
}) {
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function generate() {
    setLoading(true);
    setSelected(null);
    setRevealed(false);
    setIdx(0);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept,
          subject,
          note_content: noteContent,
        }),
      });
      const data = await res.json();
      setQuizzes(data.quizzes ?? []);
    } finally {
      setLoading(false);
    }
  }

  const current = quizzes[idx];

  function submitAnswer(optionIndex: number) {
    if (revealed || !current) return;
    setSelected(optionIndex);
    setRevealed(true);
    const correct = optionIndex === current.correctIndex;
    localQuizStore.add({
      id: uuidv4(),
      user_id: getDemoUserId(),
      concept,
      correct,
      difficulty: current.difficulty,
      created_at: new Date().toISOString(),
    });
    if (!correct) recordForgottenConcept(concept, subject ?? "bio");
  }

  return (
    <GlassCard strong>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Mini Quiz: {concept}</h3>
        <Button size="sm" onClick={generate} disabled={loading}>
          {loading ? "Generating..." : quizzes.length ? "Regenerate" : "Generate Quiz"}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Badge difficulty={current.difficulty} />
            <p className="mt-3 text-sm text-slate-200">{current.question}</p>
            <div className="mt-4 space-y-2">
              {current.options.map((opt, i) => {
                let style = "glass w-full rounded-xl px-4 py-3 text-left text-sm transition-all ";
                if (revealed) {
                  if (i === current.correctIndex) style += "ring-2 ring-emerald-500/50 bg-emerald-500/10";
                  else if (i === selected) style += "ring-2 ring-red-500/50 bg-red-500/10";
                } else if (selected === i) style += "ring-2 ring-cyan-500/50";
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={revealed}
                    onClick={() => submitAnswer(i)}
                    className={style}
                  >
                    {String.fromCharCode(65 + i)}. {opt}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <p className="mt-4 text-sm text-slate-400 border-t border-white/10 pt-4">
                {current.explanation}
              </p>
            )}
            {revealed && idx < quizzes.length - 1 && (
              <Button
                className="mt-4"
                onClick={() => {
                  setIdx((i) => i + 1);
                  setSelected(null);
                  setRevealed(false);
                }}
              >
                Next question ({idx + 2}/{quizzes.length})
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

function Badge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = {
    easy: "#34d399",
    medium: "#fbbf24",
    mcat: "#a78bfa",
  };
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
      style={{ backgroundColor: `${colors[difficulty] ?? "#94a3b8"}33`, color: colors[difficulty] }}
    >
      {difficulty}
    </span>
  );
}
