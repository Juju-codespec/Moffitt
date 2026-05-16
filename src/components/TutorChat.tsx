"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Section, SectionId } from "@/lib/sections";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TutorChatProps {
  section: Section;
  topicId: string | null;
  starterPrompts: string[];
  autoSendPrompt?: string | null;
  onAutoSendComplete?: () => void;
}

export function TutorChat({
  section,
  topicId,
  starterPrompts,
  autoSendPrompt,
  onAutoSendComplete,
}: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const nextMessages = [...messages, userMsg];
      setMessages(nextMessages);
      setInput("");
      setLoading(true);

      setMessages([...nextMessages, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: section.id as SectionId,
            topicId,
            messages: nextMessages,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          setMessages([
            ...nextMessages,
            {
              role: "assistant",
              content: `Request failed: ${err}`,
            },
          ]);
          return;
        }

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let full = "";

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            full += decoder.decode(value, { stream: true });
            setMessages([...nextMessages, { role: "assistant", content: full }]);
            scrollToBottom();
          }
        }
      } catch (e) {
        setMessages([
          ...nextMessages,
          {
            role: "assistant",
            content:
              e instanceof Error
                ? e.message
                : "Failed to connect. Is the dev server and Ollama running?",
          },
        ]);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    },
    [loading, messages, section.id, topicId, scrollToBottom]
  );

  const lastAutoSend = useRef<string | null>(null);
  useEffect(() => {
    if (!autoSendPrompt || autoSendPrompt === lastAutoSend.current) return;
    lastAutoSend.current = autoSendPrompt;
    send(autoSendPrompt);
    onAutoSendComplete?.();
  }, [autoSendPrompt, send, onAutoSendComplete]);

  return (
    <div className="flex h-full min-h-[420px] flex-col rounded-2xl border border-surface-border bg-surface-raised">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="space-y-4 py-6 text-center">
            <p className="text-sm text-slate-400">
              Ask anything about {section.shortName} before you open QBank.
              I&apos;ll explain concepts, trap answers, and give you a next step.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {starterPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => send(p)}
                  className="rounded-full border border-surface-border bg-surface px-3 py-1.5 text-left text-xs text-slate-300 transition hover:border-slate-500 hover:text-white"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-slate-700 text-white"
                  : "border border-surface-border bg-surface text-slate-200"
              }`}
            >
              {m.content || (loading && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form
        className="flex gap-2 border-t border-surface-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask your ${section.shortName} tutor…`}
          disabled={loading}
          className="flex-1 rounded-xl border border-surface-border bg-surface px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-slate-500 focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-surface disabled:opacity-40"
        >
          {loading ? "…" : "Send"}
        </button>
      </form>
    </div>
  );
}
