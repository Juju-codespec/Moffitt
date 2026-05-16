-- MCAT Pre-QBank Tutor — initial schema
CREATE EXTENSION IF NOT EXISTS vector;

-- Profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  exam_date DATE,
  target_score INT CHECK (target_score BETWEEN 472 AND 528),
  study_hours_per_week INT DEFAULT 20,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Curriculum
CREATE TABLE mcat_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

CREATE TABLE mcat_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES mcat_sections(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  parent_topic_id UUID REFERENCES mcat_topics(id),
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(section_id, slug)
);

CREATE TABLE topic_subtopics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES mcat_topics(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  high_yield BOOLEAN DEFAULT true
);

-- RAG
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_slug TEXT NOT NULL,
  topic_slug TEXT NOT NULL,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  source_path TEXT
);

CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX ON knowledge_chunks USING hnsw (embedding vector_cosine_ops);

-- User progress
CREATE TABLE user_topic_progress (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES mcat_topics(id) ON DELETE CASCADE,
  readiness_score INT DEFAULT 0 CHECK (readiness_score BETWEEN 0 AND 100),
  subscores JSONB DEFAULT '{"content":0,"equations":0,"passage":0,"timing":0,"weak_subskills":[]}'::jsonb,
  last_studied_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, topic_id)
);

CREATE TABLE briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES mcat_topics(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'full',
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX briefings_user_topic ON briefings(user_id, topic_id, created_at DESC);

CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES mcat_topics(id),
  mode TEXT NOT NULL DEFAULT 'concept',
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES mcat_topics(id),
  quiz_type TEXT NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  score INT NOT NULL,
  time_spent_sec INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE error_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES mcat_topics(id),
  concept TEXT,
  user_mistake TEXT,
  ai_correction TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES mcat_topics(id),
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  duration_sec INT
);

CREATE TABLE daily_goals (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  target_minutes INT DEFAULT 60,
  completed_minutes INT DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

CREATE TABLE streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_activity_date DATE
);

CREATE TABLE cars_practice (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  passage_type TEXT,
  strategy_used TEXT,
  score INT,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  exam_date_snapshot DATE
);

CREATE TABLE analytics_snapshots (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  metrics JSONB NOT NULL,
  PRIMARY KEY (user_id, date)
);

-- RAG search function
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_section text DEFAULT NULL,
  filter_topic text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE kc.embedding IS NOT NULL
    AND (filter_section IS NULL OR kc.metadata->>'section_slug' = filter_section)
    AND (filter_topic IS NULL OR kc.metadata->>'topic_slug' = filter_topic)
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars_practice ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_own ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY progress_own ON user_topic_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY briefings_own ON briefings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY chat_sessions_own ON chat_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY chat_messages_own ON chat_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM chat_sessions s WHERE s.id = session_id AND s.user_id = auth.uid()));
CREATE POLICY quizzes_own ON quizzes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY quiz_attempts_own ON quiz_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY error_log_own ON error_log FOR ALL USING (auth.uid() = user_id);
CREATE POLICY study_sessions_own ON study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY daily_goals_own ON daily_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY streaks_own ON streaks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY cars_practice_own ON cars_practice FOR ALL USING (auth.uid() = user_id);
CREATE POLICY study_plans_own ON study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY analytics_own ON analytics_snapshots FOR ALL USING (auth.uid() = user_id);

-- Public read for curriculum
ALTER TABLE mcat_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcat_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_subtopics ENABLE ROW LEVEL SECURITY;

CREATE POLICY sections_read ON mcat_sections FOR SELECT TO authenticated USING (true);
CREATE POLICY topics_read ON mcat_topics FOR SELECT TO authenticated USING (true);
CREATE POLICY subtopics_read ON topic_subtopics FOR SELECT TO authenticated USING (true);

-- Profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  INSERT INTO streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
