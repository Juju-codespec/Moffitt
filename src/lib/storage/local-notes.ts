import type { Note } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const NOTES_KEY = "uworld_notes";
const REVIEWS_KEY = "uworld_concept_reviews";
const QUIZ_KEY = "uworld_quiz_attempts";
const STREAK_KEY = "uworld_study_streak";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/** Local fallback when Supabase is not configured */
export const localNotesStore = {
  list(userId: string): Note[] {
    const all = readJson<Note[]>(NOTES_KEY, []);
    return all.filter((n) => n.user_id === userId).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  get(id: string): Note | undefined {
    return readJson<Note[]>(NOTES_KEY, []).find((n) => n.id === id);
  },

  search(userId: string, query: string, subject?: string): Note[] {
    const q = query.toLowerCase();
    return this.list(userId).filter((n) => {
      if (subject && n.subject !== subject) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.topic.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  },

  upsert(note: Omit<Note, "id" | "created_at" | "updated_at"> & { id?: string }): Note {
    const all = readJson<Note[]>(NOTES_KEY, []);
    const now = new Date().toISOString();
    const existing = note.id ? all.find((n) => n.id === note.id) : undefined;
    const saved: Note = {
      ...note,
      id: note.id ?? uuidv4(),
      created_at: existing?.created_at ?? now,
      updated_at: now,
    } as Note;
    const idx = all.findIndex((n) => n.id === saved.id);
    if (idx >= 0) all[idx] = saved;
    else all.push(saved);
    writeJson(NOTES_KEY, all);
    return saved;
  },

  remove(id: string): void {
    writeJson(
      NOTES_KEY,
      readJson<Note[]>(NOTES_KEY, []).filter((n) => n.id !== id)
    );
  },
};

export const localReviewsStore = {
  list(userId: string) {
    return readJson<import("@/lib/types").ConceptReview[]>(REVIEWS_KEY, []).filter(
      (r) => r.user_id === userId
    );
  },
  upsert(review: import("@/lib/types").ConceptReview) {
    const all = readJson<import("@/lib/types").ConceptReview[]>(REVIEWS_KEY, []);
    const idx = all.findIndex((r) => r.id === review.id);
    if (idx >= 0) all[idx] = review;
    else all.push(review);
    writeJson(REVIEWS_KEY, all);
    return review;
  },
};

export const localQuizStore = {
  add(attempt: import("@/lib/types").QuizAttempt) {
    const all = readJson<import("@/lib/types").QuizAttempt[]>(QUIZ_KEY, []);
    all.push(attempt);
    writeJson(QUIZ_KEY, all);
  },
  list(userId: string) {
    return readJson<import("@/lib/types").QuizAttempt[]>(QUIZ_KEY, []).filter(
      (a) => a.user_id === userId
    );
  },
};

export const localStreakStore = {
  get(userId: string): import("@/lib/types").StudyStreak {
    const all = readJson<Record<string, import("@/lib/types").StudyStreak>>(STREAK_KEY, {});
    return (
      all[userId] ?? {
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_study_date: "",
      }
    );
  },
  recordStudy(userId: string) {
    const all = readJson<Record<string, import("@/lib/types").StudyStreak>>(STREAK_KEY, {});
    const today = new Date().toISOString().slice(0, 10);
    const prev = all[userId] ?? {
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_study_date: "",
    };
    let current = prev.current_streak;
    if (prev.last_study_date !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().slice(0, 10);
      current = prev.last_study_date === yStr ? prev.current_streak + 1 : 1;
    }
    const updated: import("@/lib/types").StudyStreak = {
      user_id: userId,
      current_streak: current,
      longest_streak: Math.max(prev.longest_streak, current),
      last_study_date: today,
    };
    all[userId] = updated;
    writeJson(STREAK_KEY, all);
    return updated;
  },
};
