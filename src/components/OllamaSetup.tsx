"use client";

import { useCallback, useEffect, useState } from "react";

interface Health {
  provider: string;
  ok: boolean;
  detail: string;
  models?: string[];
  configuredModel?: string;
}

export function OllamaSetup() {
  const [health, setHealth] = useState<Health | null>(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(() => {
    setChecking(true);
    fetch("/api/health")
      .then((r) => r.json())
      .then(setHealth)
      .catch(() =>
        setHealth({
          provider: "ollama",
          ok: false,
          detail: "Cannot reach the app API. Is npm run dev running?",
        })
      )
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 8000);
    return () => clearInterval(id);
  }, [refresh]);

  if (checking && !health) {
    return null;
  }

  if (health?.ok) {
    return (
      <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <p className="text-sm font-medium text-emerald-400">
          Ollama is connected — {health.detail}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Pick a section below and start chatting with your tutor.
        </p>
      </div>
    );
  }

  const model = health?.configuredModel ?? "llama3.2";

  return (
    <div className="mb-8 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
      <h3 className="text-lg font-semibold text-amber-200">
        Connect Ollama to Moffitt
      </h3>
      <p className="mt-1 text-sm text-slate-400">
        {health?.detail ??
          "Finish these steps on your computer (same machine as this website)."}
      </p>

      <ol className="mt-4 list-inside list-decimal space-y-3 text-sm text-slate-300">
        <li>
          <span className="font-medium text-white">Open the Ollama app</span>{" "}
          (menu bar / system tray). It must stay running while you study.
        </li>
        <li>
          In Terminal, pull the tutor model:
          <pre className="mt-2 overflow-x-auto rounded-lg bg-surface p-3 font-mono text-xs text-sky-300">
            ollama pull {model}
          </pre>
        </li>
        <li>
          Confirm Ollama responds:
          <pre className="mt-2 overflow-x-auto rounded-lg bg-surface p-3 font-mono text-xs text-sky-300">
            curl http://127.0.0.1:11434/api/tags
          </pre>
        </li>
        <li>
          Start Moffitt from the project folder:
          <pre className="mt-2 overflow-x-auto rounded-lg bg-surface p-3 font-mono text-xs text-sky-300">
            npm run dev
          </pre>
        </li>
      </ol>

      {health?.models && health.models.length > 0 && (
        <p className="mt-4 text-xs text-slate-400">
          You already have:{" "}
          <span className="text-slate-200">{health.models.join(", ")}</span>.
          Set{" "}
          <code className="rounded bg-surface px-1 py-0.5">
            OLLAMA_MODEL=
            {health.models[0].split(":")[0]}
          </code>{" "}
          in <code className="rounded bg-surface px-1 py-0.5">.env</code> if you
          want to use a different model.
        </p>
      )}

      <button
        type="button"
        onClick={refresh}
        disabled={checking}
        className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-surface disabled:opacity-50"
      >
        {checking ? "Checking…" : "Check connection again"}
      </button>
    </div>
  );
}
