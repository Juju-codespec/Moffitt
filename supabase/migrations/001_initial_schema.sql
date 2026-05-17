-- UWorld AI Tutor — initial schema with pgvector for RAG
-- Run in Supabase SQL Editor or via CLI

CREATE EXTENSION IF NOT EXISTS vector;

-- Notes from UWorld explanations
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL DEFAULT '',
  uworld_section TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT 'medium',
  tags TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes(user_id);
CREATE INDEX IF NOT EXISTS notes_subject_idx ON notes(subject);
CREATE INDEX IF NOT EXISTS notes_embedding_idx ON notes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Spaced repetition / weak topics
CREATE TABLE IF NOT EXISTS concept_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  concept TEXT NOT NULL,
  subject TEXT NOT NULL,
  forget_count INT NOT NULL DEFAULT 1,
  last_reviewed TIMESTAMPTZ,
  next_review TIMESTAMPTZ NOT NULL DEFAULT now(),
  quiz_accuracy REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, concept)
);

CREATE INDEX IF NOT EXISTS concept_reviews_user_next ON concept_reviews(user_id, next_review);

-- Quiz attempts for analytics
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  concept TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quiz_attempts_user_idx ON quiz_attempts(user_id);

-- Study streaks
CREATE TABLE IF NOT EXISTS study_streaks (
  user_id TEXT PRIMARY KEY,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_study_date DATE
);

-- Chat history
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON chat_messages(session_id);

-- RAG: match notes by embedding similarity
CREATE OR REPLACE FUNCTION match_notes(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5,
  filter_user_id text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  subject text,
  topic text,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    n.id,
    n.title,
    n.content,
    n.subject,
    n.topic,
    1 - (n.embedding <=> query_embedding) AS similarity
  FROM notes n
  WHERE n.embedding IS NOT NULL
    AND (filter_user_id IS NULL OR n.user_id = filter_user_id)
    AND 1 - (n.embedding <=> query_embedding) > match_threshold
  ORDER BY n.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- RLS policies (permissive for MVP — tighten with auth.uid() in production)
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_all" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "concept_reviews_all" ON concept_reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "quiz_attempts_all" ON quiz_attempts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "study_streaks_all" ON study_streaks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "chat_messages_all" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
