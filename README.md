# Pre-QBank — MCAT Strategic Tutor

AI-powered MCAT prep platform that prepares students **before** they begin each UWorld QBank section. Built with Next.js, Supabase, OpenAI, and RAG over curated MCAT knowledge.

## Features

- **Four MCAT sections**: Chem/Phys, CARS, Bio/Biochem, Psych/Soc with topic trees
- **Before You Start**: High-yield pre-QBank briefings (full, high-yield, cram modes)
- **AI Tutor**: Streaming chat with concept, Socratic, passage, equation, CARS, error review, teach-back modes
- **Readiness scoring**: Content, equations, passage, timing subscores
- **Practice**: Original mini quizzes, equation drills, error log
- **CARS Coach**: Strategy modules and dedicated tutor mode
- **Study plan**: Diagnostic weekly plan from weaknesses + exam targets
- **Dashboard**: Recharts analytics, streaks, daily goals, predicted score range

## Tech Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Supabase (Postgres, Auth, pgvector)
- OpenAI (`gpt-4o`, `gpt-4o-mini`, `text-embedding-3-small`)
- Vercel AI SDK for streaming chat

## Quick Start (Demo Mode)

```bash
npm install
cp .env.example .env.local
# .env.local already sets NEXT_PUBLIC_DEMO_MODE=true for local use without Supabase
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → **Open App** or `/dashboard`.

Demo mode uses in-memory progress and fallback briefings when `OPENAI_API_KEY` is unset.

## Production Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run migration: `supabase/migrations/001_initial.sql` in the SQL editor
3. Enable **pgvector** extension if not already enabled
4. Copy URL and keys to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_DEMO_MODE=false
```

### 2. OpenAI

```env
OPENAI_API_KEY=sk-...
```

### 3. Seed knowledge base

```bash
npm run seed:knowledge
```

Requires service role key and OpenAI key. Ingests markdown from `content/knowledge-chunks/`.

### 4. Deploy (Vercel)

1. Import repo to Vercel
2. Add all env vars from `.env.example`
3. Set `NEXT_PUBLIC_APP_URL` to your production URL
4. Configure Supabase Auth redirect URLs for your domain

Optional: protect ingest with `RAG_INGEST_SECRET` header on `/api/rag/ingest`.

## Project Structure

```
app/              # Pages and API routes
components/       # UI, briefing, tutor, dashboard
content/          # Curriculum JSON + RAG markdown
lib/              # AI, Supabase, readiness, analytics
supabase/         # SQL migrations
scripts/          # Knowledge seeding
```

## Important

This app does **not** include UWorld or AAMC copyrighted questions. All practice content is **original** and focused on concepts, strategy, and reasoning patterns.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run seed:knowledge` | Embed and upload RAG chunks to Supabase |
