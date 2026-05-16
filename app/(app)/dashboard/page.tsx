"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReadinessRing } from "@/components/dashboard/readiness-ring";
import { StudyTimer } from "@/components/study/study-timer";
import { getAllSections } from "@/lib/data/curriculum";

export default function DashboardPage() {
  const [data, setData] = useState<{
    bySection: { section: string; slug: string; readiness: number }[];
    avgReadiness: number;
    trend: { date: string; accuracy: number; readiness: number }[];
    prediction: { low: number; high: number; disclaimer: string };
    streak: { current: number; longest: number };
    dailyGoal: { target: number; completed: number };
    weakConcepts: { concept: string }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then((r) => r.json())
      .then(setData);
  }, []);

  const sections = getAllSections();

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-400">
            Readiness, trends, and predicted score range
          </p>
        </div>
        <StudyTimer />
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Avg Readiness</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <ReadinessRing value={data?.avgReadiness ?? 0} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Predicted Range</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-400">
              {data?.prediction.low ?? "—"}–{data?.prediction.high ?? "—"}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {data?.prediction.disclaimer?.slice(0, 60)}...
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{data?.streak.current ?? 0} days</p>
            <p className="text-xs text-zinc-500">
              Best: {data?.streak.longest ?? 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-zinc-400">Daily Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-sm">
              {data?.dailyGoal.completed ?? 0} / {data?.dailyGoal.target ?? 60} min
            </p>
            <Progress
              value={
                ((data?.dailyGoal.completed ?? 0) /
                  (data?.dailyGoal.target ?? 60)) *
                100
              }
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Readiness by Section</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.bySection ?? []}>
                <XAxis dataKey="section" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                  }}
                />
                <Bar dataKey="readiness" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy & Readiness Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.trend ?? []}>
                <XAxis dataKey="date" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                  }}
                />
                <Line type="monotone" dataKey="accuracy" stroke="#10b981" dot={false} />
                <Line type="monotone" dataKey="readiness" stroke="#6366f1" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold">Sections</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => {
            const sec = data?.bySection.find((b) => b.slug === s.slug);
            return (
              <Link key={s.slug} href={`/sections/${s.slug}`}>
                <Card className="transition-colors hover:border-emerald-500/30">
                  <CardContent className="flex items-center justify-between p-4">
                    <span className="font-medium">{s.name}</span>
                    <ReadinessRing value={sec?.readiness ?? 35} size={40} />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
