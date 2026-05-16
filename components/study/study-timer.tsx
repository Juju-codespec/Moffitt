"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Square } from "lucide-react";

export function StudyTimer({ onSessionEnd }: { onSessionEnd?: (mins: number) => void }) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const stop = async () => {
    setRunning(false);
    const durationMinutes = Math.max(1, Math.round(seconds / 60));
    onSessionEnd?.(durationMinutes);
    await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ durationMinutes, topicsStudied: [] }),
    }).catch(() => {});
    setSeconds(0);
  };

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3">
      <span className="font-mono text-2xl tabular-nums text-emerald-400">
        {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </span>
      <Button
        size="icon"
        variant="secondary"
        onClick={() => setRunning(!running)}
        aria-label={running ? "Pause" : "Start"}
      >
        {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button size="icon" variant="ghost" onClick={stop} aria-label="End session">
        <Square className="h-4 w-4" />
      </Button>
    </div>
  );
}
