import type { DifficultyLevel, McatSubjectId } from "@/lib/constants/subjects";

/** Core note entity — user's UWorld explanation capture */
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  subject: McatSubjectId;
  topic: string;
  uworld_section: string;
  difficulty: DifficultyLevel;
  tags: string[];
  created_at: string;
  updated_at: string;
  /** Optional embedding for RAG (stored in DB, not always loaded) */
  embedding?: number[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  metadata?: {
    concept?: string;
    mermaid?: string;
    quiz?: MiniQuizPayload;
  };
}

export interface MiniQuizPayload {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty: "easy" | "medium" | "mcat";
}

export interface ConceptReview {
  id: string;
  user_id: string;
  concept: string;
  subject: McatSubjectId;
  forget_count: number;
  last_reviewed: string | null;
  next_review: string;
  quiz_accuracy: number;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  concept: string;
  correct: boolean;
  difficulty: string;
  created_at: string;
}

export interface StudyStreak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_study_date: string;
}

export interface TutorResponse {
  concept: string;
  highYieldSummary: string;
  keyEquation?: string;
  memoryTrick?: string;
  mermaidDiagram?: string;
  commonTrap?: string;
  miniQuiz?: MiniQuizPayload;
  fullMarkdown: string;
}
