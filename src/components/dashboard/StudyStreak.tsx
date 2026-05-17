"use client";

import { useEffect, useState } from "react";
import { Flame } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localStreakStore } from "@/lib/storage/local-notes";

export function StudyStreak() {
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  useEffect(() => {
    const s = localStreakStore.get(getDemoUserId());
    setStreak({ current: s.current_streak, longest: s.longest_streak });
  }, []);

  return (
    <GlassCard className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/20">
        <Flame className="h-6 w-6 text-orange-400" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{streak.current}</p>
        <p className="text-xs text-slate-500">day streak · best {streak.longest}</p>
      </div>
    </GlassCard>
  );
}
