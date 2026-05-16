"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { McatTopic } from "@/types";

export function ConceptTree({ topics }: { topics: McatTopic[] }) {
  const [open, setOpen] = useState<string | null>(topics[0]?.id ?? null);

  return (
    <div className="space-y-1">
      {topics.map((topic) => {
        const isOpen = open === topic.id;
        return (
          <div key={topic.id} className="rounded-lg border border-zinc-800/60">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : topic.id)}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-zinc-800/40"
            >
              <ChevronRight
                className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")}
              />
              <span className="font-medium text-zinc-200">{topic.name}</span>
            </button>
            {isOpen && (
              <ul className="border-t border-zinc-800/60 px-3 py-2">
                {(topic.subtopics ?? []).map((s) => (
                  <li
                    key={s.name}
                    className="flex items-center justify-between py-1.5 text-xs text-zinc-400"
                  >
                    {s.name}
                    {s.high_yield && (
                      <span className="text-emerald-500">high-yield</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
