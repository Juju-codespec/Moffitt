"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { MermaidDiagram } from "@/components/visuals/MermaidDiagram";

/** Markdown + LaTeX + Mermaid for tutor messages */
export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className ?? "");
          const lang = match?.[1];
          const code = String(children).replace(/\n$/, "");
          if (lang === "mermaid") {
            return <MermaidDiagram chart={code} />;
          }
          return (
            <code className="rounded bg-black/40 px-1.5 py-0.5 text-cyan-200" {...props}>
              {children}
            </code>
          );
        },
        h2: ({ children }) => (
          <h2 className="mt-4 mb-2 text-base font-semibold text-cyan-300">{children}</h2>
        ),
        p: ({ children }) => <p className="mb-2 text-sm leading-relaxed text-slate-300">{children}</p>,
        ul: ({ children }) => <ul className="mb-2 list-disc pl-5 text-sm text-slate-300">{children}</ul>,
        ol: ({ children }) => <ol className="mb-2 list-decimal pl-5 text-sm text-slate-300">{children}</ol>,
        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
