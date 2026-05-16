"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Filter, Map, BookOpen } from "lucide-react";

const modules = [
  {
    title: "Passage Strategy",
    desc: "10-minute budget, annotation system, and when to move on.",
    icon: Clock,
  },
  {
    title: "Question Type Recognition",
    desc: "Main idea, inference, strengthen/weaken, and tone questions.",
    icon: Filter,
  },
  {
    title: "Logic Mapping",
    desc: "Claim → evidence → qualification diagrams for dense humanities passages.",
    icon: Map,
  },
  {
    title: "Elimination Training",
    desc: "Extreme language, scope errors, and half-right traps.",
    icon: BookOpen,
  },
];

export default function CarsCoachPage() {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">CARS Coach</h1>
      <p className="mt-2 max-w-2xl text-sm text-zinc-400">
        Specialized training for timing, tone, main idea extraction, and
        elimination — with original practice passages only.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {modules.map((m) => (
          <Card key={m.title}>
            <CardHeader className="flex flex-row items-center gap-3">
              <m.icon className="h-6 w-6 text-emerald-400" />
              <CardTitle className="text-base">{m.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">{m.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Practice with AI</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/tutor?section=cars">
            <Button>Open CARS Tutor Mode</Button>
          </Link>
          <Link href="/sections/cars">
            <Button variant="secondary">CARS Topics</Button>
          </Link>
          <Button
            variant="outline"
            onClick={() =>
              fetch("/api/quiz/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  topicId: "topic-humanities",
                  quizType: "cars",
                }),
              }).then(() => alert("Quiz generated — open Practice tab"))
            }
          >
            Generate CARS Mini Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
