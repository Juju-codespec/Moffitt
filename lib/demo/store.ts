/**
 * In-memory demo store when Supabase auth is not configured.
 * Persists only for the server process lifetime.
 */

import type { BeforeYouStartBriefing, ReadinessSubscores, QuizQuestion } from "@/types";

const DEMO_USER_ID = "demo-user";

interface DemoProgress {
  topic_id: string;
  readiness_score: number;
  subscores: ReadinessSubscores;
  last_studied_at: string | null;
}

const progress = new Map<string, DemoProgress>();
const briefings = new Map<string, { payload: BeforeYouStartBriefing; created_at: number }>();
const quizzes = new Map<string, { questions: QuizQuestion[]; topic_id: string }>();
const errors: Array<{
  id: string;
  topic_id: string;
  concept: string;
  user_mistake: string;
  ai_correction: string;
  created_at: string;
}> = [];

let streak = { current: 3, longest: 7, last_activity: new Date().toISOString().slice(0, 10) };
let dailyGoal = { target: 60, completed: 25 };

export function getDemoUserId() {
  return DEMO_USER_ID;
}

export function isDemoMode() {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

export function getDemoProgress(topicId: string): DemoProgress | undefined {
  return progress.get(topicId);
}

export function setDemoProgress(topicId: string, data: DemoProgress) {
  progress.set(topicId, data);
}

export function getDemoBriefing(key: string) {
  const b = briefings.get(key);
  if (!b) return null;
  if (Date.now() - b.created_at > 24 * 60 * 60 * 1000) {
    briefings.delete(key);
    return null;
  }
  return b.payload;
}

export function setDemoBriefing(key: string, payload: BeforeYouStartBriefing) {
  briefings.set(key, { payload, created_at: Date.now() });
}

export function getDemoStreak() {
  return streak;
}

export function getDemoDailyGoal() {
  return dailyGoal;
}

export function addDemoStudyMinutes(mins: number) {
  dailyGoal.completed = Math.min(dailyGoal.target, dailyGoal.completed + mins);
}

export function saveDemoQuiz(id: string, questions: QuizQuestion[], topicId: string) {
  quizzes.set(id, { questions, topic_id: topicId });
}

export function getDemoQuiz(id: string) {
  return quizzes.get(id);
}

export function addDemoError(entry: Omit<(typeof errors)[0], "id" | "created_at">) {
  errors.unshift({
    ...entry,
    id: `err-${Date.now()}`,
    created_at: new Date().toISOString(),
  });
}

export function getDemoErrors() {
  return errors.slice(0, 20);
}

export function getAllDemoProgress() {
  return Array.from(progress.values());
}
