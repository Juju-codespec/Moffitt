"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { MCAT_SUBJECTS } from "@/lib/constants/subjects";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localReviewsStore, localQuizStore } from "@/lib/storage/local-notes";
import type { ConceptReview } from "@/lib/types";

export default function WeakTopicsPage() {
  const [forgotten, setForgotten] = useState<ConceptReview[]>([]);
  const [accuracy, setAccuracy] = useState<Record<string, number>>({});

  useEffect(() => {
    const userId = getDemoUserId();
    const reviews = localReviewsStore
      .list(userId)
      .sort((a, b) => b.forget_count - a.forget_count);
    setForgotten(reviews);

    const attempts = localQuizStore.list(userId);
    const byConcept: Record<string, { correct: number; total: number }> = {};
    for (const a of attempts) {
      if (!byConcept[a.concept]) byConcept[a.concept] = { correct: 0, total: 0 };
      byConcept[a.concept].total++;
      if (a.correct) byConcept[a.concept].correct++;
    }
    const acc: Record<string, number> = {};
    for (const [c, v] of Object.entries(byConcept)) {
      acc[c] = Math.round((v.correct / v.total) * 100);
    }
    setAccuracy(acc);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Weak Topics</h1>
        <p className="text-sm text-slate-500">
          Most forgotten concepts & spaced repetition queue.
        </p>
      </div>

      <GlassCard strong className="border-amber-500/20">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h2 className="font-semibold text-white">Most Forgotten Concepts</h2>
        </div>
        {forgotten.length === 0 ? (
          <p className="text-sm text-slate-500">
            Miss quiz questions or mark concepts during review to populate this list.
          </p>
        ) : (
          <ul className="space-y-3">
            {forgotten.map((r) => {
              const sub = MCAT_SUBJECTS.find((s) => s.id === r.subject);
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-white">{r.concept}</p>
                    <p className="text-xs text-slate-500">
                      Forgot {r.forget_count}× · Quiz accuracy{" "}
                      {accuracy[r.concept] ?? "—"}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub && <Badge color={sub.color}>{sub.label}</Badge>}
                    <Link href="/tutor" className="text-xs text-cyan-400 hover:underline">
                      Relearn →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
