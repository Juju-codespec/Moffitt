"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localNotesStore, localStreakStore } from "@/lib/storage/local-notes";
import type { ChatMessage } from "@/lib/types";

const STARTERS = [
  "Forgot Bernoulli pressure relationship",
  "Explain amino acid chirality simply",
  "Krebs cycle high-yield summary",
  "Teach me renal clearance",
];

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [simplifyNext, setSimplifyNext] = useState(false);
  const [weakSubject, setWeakSubject] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const userId = getDemoUserId();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const localNotes = localNotesStore.list(userId);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          messages: [...messages, userMsg].map(({ role, content: c }) => ({ role, content: c })),
          local_notes: localNotes,
          simplify: simplifyNext,
          weak_subject: weakSubject || undefined,
        }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.reply ?? "Sorry, something went wrong.",
          created_at: new Date().toISOString(),
        },
      ]);
      localStreakStore.recordStudy(userId);
      setSimplifyNext(false);
    } catch {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Connection error. Check your API keys and try again.",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:h-[calc(100vh-6rem)]">
      <GlassCard className="flex flex-wrap gap-2 border-cyan-500/10">
        <Button size="sm" variant="secondary" onClick={() => setSimplifyNext(true)}>
          Explain simpler
        </Button>
        <select
          value={weakSubject}
          onChange={(e) => setWeakSubject(e.target.value)}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
        >
          <option value="">Weak at subject...</option>
          <option value="physics">Physics</option>
          <option value="biochem">Biochemistry</option>
          <option value="chem">Chemistry</option>
          <option value="bio">Biology</option>
          <option value="psych">Psych/Soc</option>
        </select>
        <Button size="sm" variant="ghost" title="Voice mode (coming soon)" disabled>
          <Mic className="h-4 w-4" /> Voice
        </Button>
      </GlassCard>

      <GlassCard strong className="flex-1 overflow-hidden flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Sparkles className="mb-3 h-10 w-10 text-cyan-400" />
              <h2 className="text-lg font-semibold text-white">AI MCAT Tutor</h2>
              <p className="mt-1 max-w-md text-sm text-slate-500">
                Ask anything — I&apos;ll use your UWorld notes when available.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="glass rounded-full px-3 py-1.5 text-xs text-cyan-300 hover:border-cyan-500/30"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <motion.div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-cyan-500/20 text-cyan-50"
                      : "glass text-slate-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <MarkdownRenderer content={msg.content} />
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex gap-1 px-4">
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:0.2s]" />
            </div>
          )}
          <motion.div ref={bottomRef} />
        </div>

        <div className="border-t border-white/10 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a concept you forgot..."
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus:border-cyan-500/40 focus:outline-none"
            />
            <Button type="submit" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </GlassCard>
    </div>
  );
}
