"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { BeforeYouStartBriefing, BriefingMode } from "@/types";
import { CheckCircle2, Circle } from "lucide-react";

export function BriefingView({
  briefing,
  topicId,
  onChecklistUpdate,
}: {
  briefing: BeforeYouStartBriefing;
  topicId: string;
  onChecklistUpdate?: (pct: number) => void;
}) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    const next = new Set(checked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setChecked(next);
    const pct = (next.size / briefing.confidenceChecklist.length) * 100;
    onChecklistUpdate?.(pct);
    fetch("/api/readiness/recalculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, checklistCompletion: pct }),
    }).catch(() => {});
  };

  const sections = [
    { title: "Overview", content: briefing.overview },
    {
      title: "Common Struggles",
      list: briefing.commonStruggles,
    },
    {
      title: "Core Concepts",
      nodes: briefing.coreConcepts,
    },
    {
      title: "Equations",
      nodes: briefing.equations,
    },
    {
      title: "Pattern Recognition",
      list: briefing.patternRecognition,
    },
    {
      title: "Passage Tips",
      list: briefing.passageTips,
    },
    {
      title: "Timing",
      content: `${briefing.timing.recommendedPace}\n\nFlagging: ${briefing.timing.flaggingStrategy}`,
    },
    {
      title: "Traps & Distractors",
      nodes: briefing.traps,
    },
    {
      title: "Reasoning Shortcuts",
      list: briefing.reasoningShortcuts,
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6"
      >
        <p className="text-lg leading-relaxed text-zinc-100">
          {briefing.openingCoachMessage}
        </p>
      </motion.div>

      {sections.map((s, i) => (
        <motion.div
          key={s.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-zinc-300">
              {"content" in s && s.content && (
                <p className="whitespace-pre-wrap">{s.content}</p>
              )}
              {"list" in s &&
                s.list?.map((item) => (
                  <p key={item} className="flex gap-2">
                    <span className="text-emerald-500">•</span> {item}
                  </p>
                ))}
              {"nodes" in s &&
                Array.isArray(s.nodes) &&
                s.nodes.map((n, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
                  >
                    {"name" in n && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-100">{n.name}</span>
                        {"priority" in n && (
                          <Badge
                            variant={
                              n.priority === "critical" ? "warning" : "secondary"
                            }
                          >
                            {n.priority}
                          </Badge>
                        )}
                      </div>
                    )}
                    {"summary" in n && <p className="mt-1">{n.summary}</p>}
                    {"formula" in n && (
                      <p className="mt-1 font-mono text-emerald-400">{n.formula}</p>
                    )}
                    {"whenToUse" in n && (
                      <p className="mt-1 text-xs text-zinc-500">When: {n.whenToUse}</p>
                    )}
                    {"trap" in n && (
                      <>
                        <p className="font-medium text-amber-400">{n.trap}</p>
                        <p className="text-xs">{n.whyTempting}</p>
                        <p className="text-xs text-emerald-400/80">{n.howToAvoid}</p>
                      </>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </motion.div>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Confidence Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {briefing.confidenceChecklist.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => toggle(i)}
              className="flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-zinc-800/50"
            >
              {checked.has(i) ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
              ) : (
                <Circle className="mt-0.5 h-5 w-5 text-zinc-600" />
              )}
              <div>
                <p className="text-sm text-zinc-200">{item.item}</p>
                <p className="text-xs text-zinc-500">{item.selfRateHint}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
