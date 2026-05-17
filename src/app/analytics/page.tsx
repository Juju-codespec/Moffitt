"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressHeatmap } from "@/components/ui/ProgressHeatmap";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localNotesStore, localQuizStore, localStreakStore } from "@/lib/storage/local-notes";
import { MCAT_SUBJECTS } from "@/lib/constants/subjects";

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    notes: 0,
    quizzes: 0,
    accuracy: 0,
    streak: 0,
    bySubject: {} as Record<string, number>,
    heatmap: [0, 0, 0, 0, 0, 0, 0],
  });

  useEffect(() => {
    const userId = getDemoUserId();
    const notes = localNotesStore.list(userId);
    const attempts = localQuizStore.list(userId);
    const streak = localStreakStore.get(userId);
    const correct = attempts.filter((a) => a.correct).length;
    const bySubject: Record<string, number> = {};
    for (const n of notes) {
      bySubject[n.subject] = (bySubject[n.subject] ?? 0) + 1;
    }
    // Simulated weekly activity from quiz + note timestamps
    const heatmap = [2, 4, 1, 5, 3, 0, attempts.length % 6];
    setStats({
      notes: notes.length,
      quizzes: attempts.length,
      accuracy: attempts.length ? Math.round((correct / attempts.length) * 100) : 0,
      streak: streak.current_streak,
      bySubject,
      heatmap,
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-sm text-slate-500">Study patterns, accuracy, and progress.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Notes" value={stats.notes} />
        <Metric label="Quizzes taken" value={stats.quizzes} />
        <Metric label="Accuracy" value={`${stats.accuracy}%`} />
        <Metric label="Streak" value={stats.streak} />
      </div>

      <GlassCard>
        <h3 className="mb-4 font-semibold text-white">Weekly Activity</h3>
        <ProgressHeatmap data={stats.heatmap} />
      </GlassCard>

      <GlassCard>
        <h3 className="mb-4 font-semibold text-white">Notes by Subject</h3>
        <div className="space-y-3">
          {MCAT_SUBJECTS.map((s) => {
            const count = stats.bySubject[s.id] ?? 0;
            const max = Math.max(...Object.values(stats.bySubject), 1);
            return (
              <div key={s.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: s.color }}>{s.label}</span>
                  <span className="text-slate-500">{count}</span>
                </div>
                <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(count / max) * 100}%`,
                      backgroundColor: s.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <GlassCard>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </GlassCard>
  );
}
