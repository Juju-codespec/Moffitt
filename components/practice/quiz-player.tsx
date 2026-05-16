"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QuizQuestion } from "@/types";
import { cn } from "@/lib/utils";

export function QuizPlayer({
  quizId,
  questions,
  onComplete,
}: {
  quizId: string;
  questions: QuizQuestion[];
  onComplete?: (result: { score: number }) => void;
}) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ score: number } | null>(null);
  const [startTime] = useState(Date.now());

  const q = questions[index];

  const submit = async () => {
    const timeSpentSec = Math.round((Date.now() - startTime) / 1000);
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, answers, timeSpentSec }),
    });
    const data = await res.json();
    setSubmitted(true);
    setResult({ score: data.score });
    onComplete?.({ score: data.score });
  };

  if (submitted && result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-emerald-400">{result.score}%</p>
          <p className="mt-2 text-sm text-zinc-400">
            Readiness updated. Review errors in Practice → Error Log.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Question {index + 1} of {questions.length}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-200">{q.stem}</p>
        <div className="space-y-2">
          {q.choices.map((choice, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                const next = [...answers];
                next[index] = i;
                setAnswers(next);
              }}
              className={cn(
                "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                answers[index] === i
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-zinc-700 hover:bg-zinc-800/50"
              )}
            >
              {choice}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {index > 0 && (
            <Button variant="secondary" onClick={() => setIndex(index - 1)}>
              Back
            </Button>
          )}
          {index < questions.length - 1 ? (
            <Button
              className="ml-auto"
              disabled={answers[index] === null}
              onClick={() => setIndex(index + 1)}
            >
              Next
            </Button>
          ) : (
            <Button
              className="ml-auto"
              disabled={answers.some((a) => a === null)}
              onClick={submit}
            >
              Submit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
