"use client";

import { GlassCard } from "@/components/ui/GlassCard";

export function EquationCard({
  title,
  equation,
  trick,
}: {
  title: string;
  equation: string;
  trick?: string;
}) {
  return (
    <GlassCard className="border-l-2 border-l-cyan-500/50">
      <p className="text-xs font-medium uppercase text-cyan-400/80">{title}</p>
      <p className="mt-2 font-mono text-lg text-white">{equation}</p>
      {trick && <p className="mt-2 text-sm text-slate-500">💡 {trick}</p>}
    </GlassCard>
  );
}
