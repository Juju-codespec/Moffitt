"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatMode } from "@/types";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES: { value: ChatMode; label: string }[] = [
  { value: "concept", label: "Concept" },
  { value: "socratic", label: "Socratic" },
  { value: "passage", label: "Passage" },
  { value: "equation", label: "Equation" },
  { value: "cars", label: "CARS" },
  { value: "error_review", label: "Error Review" },
  { value: "teach_back", label: "Teach-Back" },
];

function getMessageText(
  m: { parts?: Array<{ type: string; text?: string }> }
) {
  return (
    m.parts
      ?.filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join("") ?? ""
  );
}

export function ChatPanel({
  topicId,
  section,
}: {
  topicId?: string;
  section?: string;
}) {
  const [mode, setMode] = useState<ChatMode>("concept");
  const [foundation, setFoundation] = useState(false);
  const [input, setInput] = useState("");

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { mode, topicId, section, foundationMode: foundation },
      }),
    [mode, topicId, section, foundation]
  );

  const { messages, sendMessage, status, error } = useChat({ transport });

  const isLoading = status === "streaming" || status === "submitted";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    await sendMessage({ text });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col rounded-xl border border-zinc-800 bg-zinc-900/30">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 p-3">
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMode(m.value)}
            className={cn(
              "rounded-full px-3 py-1 text-xs",
              mode === m.value
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            )}
          >
            {m.label}
          </button>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setFoundation(!foundation)}
          className={cn(foundation && "border-emerald-500/50 text-emerald-400")}
        >
          <Sparkles className="mr-1 h-3 w-3" />
          Missing Foundation?
        </Button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-center text-sm text-zinc-500">
            Ask anything about MCAT concepts, strategy, or reasoning.
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "max-w-[85%] rounded-xl px-4 py-3 text-sm",
              m.role === "user"
                ? "ml-auto bg-emerald-600/20 text-zinc-100"
                : "bg-zinc-800/80 text-zinc-200"
            )}
          >
            <ReactMarkdown>{getMessageText(m)}</ReactMarkdown>
          </div>
        ))}
        {error && (
          <p className="text-sm text-amber-400">
            {error.message.includes("503") || error.message.includes("OpenAI")
              ? "Set OPENAI_API_KEY to enable live AI tutoring."
              : error.message}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t border-zinc-800 p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your MCAT coach..."
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
