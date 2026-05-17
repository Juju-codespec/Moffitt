"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

/** Render Mermaid diagrams from AI responses */
export function MermaidDiagram({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
    });

    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    mermaid
      .render(id, chart)
      .then(({ svg: rendered }) => setSvg(rendered))
      .catch((e) => setError(String(e)));
  }, [chart]);

  if (error) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-black/30 p-3 text-xs text-slate-400">
        {chart}
      </pre>
    );
  }

  return (
    <div
      ref={ref}
      className="mermaid-container my-4 flex justify-center overflow-x-auto rounded-xl bg-black/20 p-4"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
