"use client";

import { useState } from "react";
import { getAllSections, getTopicsBySection } from "@/lib/data/curriculum";
import { QuizPlayer } from "@/components/practice/quiz-player";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuizQuestion } from "@/types";

export default function PracticePage() {
  const [topicId, setTopicId] = useState("topic-fluids");
  const [quizId, setQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  const sections = getAllSections();
  const allTopics = sections.flatMap((s) =>
    getTopicsBySection(s.slug).map((t) => ({ ...t, sectionName: s.name }))
  );

  const generate = async (type: string) => {
    setLoading(true);
    const res = await fetch("/api/quiz/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, quizType: type, count: 5 }),
    });
    const data = await res.json();
    setQuizId(data.quizId);
    setQuestions(data.questions);
    setLoading(false);
  };

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold">Practice</h1>
      <p className="mt-2 text-sm text-zinc-400">
        Original mini quizzes, equation drills, and error log review.
      </p>

      {!quizId ? (
        <Card className="mt-8 max-w-xl">
          <CardHeader>
            <CardTitle className="text-base">Generate quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
            >
              {allTopics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.sectionName})
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => generate("mini")} disabled={loading}>
                Mini Quiz
              </Button>
              <Button
                variant="secondary"
                onClick={() => generate("equation_drill")}
                disabled={loading}
              >
                Equation Drill
              </Button>
              <Button
                variant="outline"
                onClick={() => generate("recall")}
                disabled={loading}
              >
                Recall Challenge
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 max-w-2xl">
          <QuizPlayer
            quizId={quizId}
            questions={questions}
            onComplete={() => setQuizId(null)}
          />
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              setQuizId(null);
              setQuestions([]);
            }}
          >
            New quiz
          </Button>
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Error log</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400">
          Wrong answers from quizzes are logged automatically with AI corrections.
          Review them in your next tutor session using Error Review mode.
        </CardContent>
      </Card>
    </div>
  );
}
