"use client";

import { useEffect, useState } from "react";

interface Health {
  provider: string;
  ok: boolean;
  detail: string;
}

export function HealthBadge() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() =>
        setHealth({ provider: "?", ok: false, detail: "Cannot reach API" })
      );
  }, []);

  if (!health) {
    return (
      <span className="rounded-full bg-surface-raised px-3 py-1 text-xs text-slate-500">
        Checking LLM…
      </span>
    );
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs ${
        health.ok
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-amber-500/15 text-amber-400"
      }`}
      title={health.detail}
    >
      {health.ok ? "●" : "○"} {health.provider} — {health.detail}
    </span>
  );
}
