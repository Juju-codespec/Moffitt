"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";

const WORK_SEC = 25 * 60;
const BREAK_SEC = 5 * 60;

export function PomodoroTimer() {
  const [seconds, setSeconds] = useState(WORK_SEC);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          setRunning(false);
          setIsBreak((b) => !b);
          return isBreak ? WORK_SEC : BREAK_SEC;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, isBreak]);

  const reset = useCallback(() => {
    setRunning(false);
    setIsBreak(false);
    setSeconds(WORK_SEC);
  }, []);

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <GlassCard>
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        Pomodoro · {isBreak ? "Break" : "Focus"}
      </p>
      <p className="mt-2 text-4xl font-mono font-bold text-cyan-300">
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </p>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => setRunning((r) => !r)}>
          {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button size="sm" variant="secondary" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </GlassCard>
  );
}
