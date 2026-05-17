"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  Brain,
  Zap,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { StudyStreak } from "@/components/dashboard/StudyStreak";
import { PomodoroTimer } from "@/components/dashboard/PomodoroTimer";
import { DailyReviewQueue } from "@/components/dashboard/DailyReviewQueue";
import { EquationCard } from "@/components/ui/EquationCard";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localNotesStore, localReviewsStore } from "@/lib/storage/local-notes";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ notes: 0, weak: 0 });

  useEffect(() => {
    const id = getDemoUserId();
    setStats({
      notes: localNotesStore.list(id).length,
      weak: localReviewsStore
        .list(id)
        .sort((a, b) => b.forget_count - a.forget_count)
        .slice(0, 5).length,
    });
  }, []);

  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back
          </h1>
          <p className="mt-1 text-slate-500">
            Relearn any UWorld miss in under 2 minutes.
          </p>
        </div>
        <Link href="/tutor">
          <Button size="lg">
            Start tutoring <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </motion.header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={BookOpen} label="Notes saved" value={String(stats.notes)} href="/notes" />
        <StatCard icon={MessageSquare} label="AI Tutor" value="Chat" href="/tutor" />
        <StatCard icon={Brain} label="Quiz mode" value="Practice" href="/quiz" />
        <StatCard icon={Zap} label="Weak topics" value={String(stats.weak)} href="/weak-topics" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <StudyStreak />
        <PomodoroTimer />
        <EquationCard
          title="Quick recall"
          equation="P + ½ρv² + ρgh = const"
          trick="Fast fluid = less pushing pressure"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyReviewQueue />
        <GlassCard>
          <h3 className="mb-4 font-semibold text-white">Teach Before Practice</h3>
          <p className="text-sm text-slate-500 mb-4">
            Get a high-yield summary before starting a UWorld section.
          </p>
          <TeachBeforeQuick />
        </GlassCard>
      </div>

      <GlassCard>
        <h3 className="mb-3 font-semibold text-white">Quick actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/notes">
            <Button variant="secondary">Capture notes</Button>
          </Link>
          <Link href="/tutor">
            <Button variant="secondary">Ask AI tutor</Button>
          </Link>
          <Link href="/quiz">
            <Button variant="secondary">Generate quiz</Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <GlassCard className="hover:border-cyan-500/30 transition-colors cursor-pointer h-full">
        <Icon className="h-5 w-5 text-cyan-400 mb-2" />
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </GlassCard>
    </Link>
  );
}

function TeachBeforeQuick() {
  const [section, setSection] = useState("Fluids");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/teach-before", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, subject: "physics" }),
    });
    const data = await res.json();
    setSummary(data.summary ?? "");
    setLoading(false);
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
        />
        <Button size="sm" onClick={load} disabled={loading}>
          {loading ? "..." : "Summarize"}
        </Button>
      </div>
      {summary && (
        <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap text-xs text-slate-400">
          {summary}
        </pre>
      )}
    </div>
  );
}
