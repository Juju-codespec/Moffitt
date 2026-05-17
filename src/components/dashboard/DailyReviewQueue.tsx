"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localNotesStore, localReviewsStore } from "@/lib/storage/local-notes";
import type { ConceptReview } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

/** Build daily review from notes + concept reviews */
export function DailyReviewQueue() {
  const [items, setItems] = useState<{ concept: string; subject: string }[]>([]);

  useEffect(() => {
    const userId = getDemoUserId();
    const reviews = localReviewsStore.list(userId);
    const due = reviews.filter(
      (r) => !r.next_review || new Date(r.next_review) <= new Date()
    );
    if (due.length > 0) {
      setItems(due.map((r) => ({ concept: r.concept, subject: r.subject })));
      return;
    }
    // Seed from recent notes if no reviews
    const notes = localNotesStore.list(userId).slice(0, 5);
    setItems(
      notes.map((n) => ({
        concept: n.title,
        subject: n.subject,
      }))
    );
  }, []);

  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-cyan-400" />
        <h3 className="font-semibold text-white">Daily Review Queue</h3>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Add notes to build your review queue.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
              <span className="text-slate-300">{item.concept}</span>
              <Link href="/tutor" className="text-xs text-cyan-400 hover:underline">
                Review →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}

/** Track forgotten concept for spaced repetition */
export function recordForgottenConcept(concept: string, subject: string) {
  const userId = getDemoUserId();
  const reviews = localReviewsStore.list(userId);
  const existing = reviews.find((r) => r.concept === concept);
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + (existing ? Math.min(existing.forget_count * 2, 14) : 1));

  const review: ConceptReview = existing
    ? {
        ...existing,
        forget_count: existing.forget_count + 1,
        last_reviewed: now.toISOString(),
        next_review: next.toISOString(),
      }
    : {
        id: uuidv4(),
        user_id: userId,
        concept,
        subject: subject as ConceptReview["subject"],
        forget_count: 1,
        last_reviewed: now.toISOString(),
        next_review: next.toISOString(),
        quiz_accuracy: 0,
      };
  localReviewsStore.upsert(review);
}
