"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudyPlanPage() {
  const [examDate, setExamDate] = useState("");
  const [targetScore, setTargetScore] = useState("510");
  const [hoursPerWeek, setHoursPerWeek] = useState("20");
  const [plan, setPlan] = useState<{
    weeks: Array<{
      week: number;
      sessions: Array<{ topic: string; focus: string; minutes: number }>;
    }>;
    priorities: Array<{ topicName: string; reason: string }>;
    aiSummary?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    const res = await fetch("/api/study-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examDate,
        targetScore: Number(targetScore),
        hoursPerWeek: Number(hoursPerWeek),
      }),
    });
    const data = await res.json();
    setPlan(data.plan);
    if (data.aiSummary) {
      setPlan((p) => (p ? { ...p, aiSummary: data.aiSummary } : p));
    }
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">Diagnostic Study Plan</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Personalized paths prioritizing highest-yield weaknesses and foundational
        gaps.
      </p>

      <Card className="mt-8 max-w-lg">
        <CardHeader>
          <CardTitle className="text-base">Your targets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500">Exam date</label>
            <Input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Target score</label>
            <Input
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500">Hours per week</label>
            <Input
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(e.target.value)}
            />
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? "Generating..." : "Generate Plan"}
          </Button>
        </CardContent>
      </Card>

      {plan && (
        <div className="mt-8 space-y-6">
          {plan.aiSummary && (
            <Card>
              <CardContent className="p-6 text-sm text-zinc-300 whitespace-pre-wrap">
                {plan.aiSummary}
              </CardContent>
            </Card>
          )}
          <div>
            <h2 className="mb-3 font-semibold">Top priorities</h2>
            <ul className="space-y-2">
              {plan.priorities.map((p, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 text-sm"
                >
                  <span className="font-medium text-emerald-400">{p.topicName}</span>
                  <span className="text-zinc-400"> — {p.reason}</span>
                </li>
              ))}
            </ul>
          </div>
          {plan.weeks.map((w) => (
            <Card key={w.week}>
              <CardHeader>
                <CardTitle className="text-base">Week {w.week}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {w.sessions.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between rounded-lg bg-zinc-800/40 px-3 py-2 text-sm"
                  >
                    <span>{s.topic}</span>
                    <span className="text-zinc-500">
                      {s.minutes}m · {s.focus}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
