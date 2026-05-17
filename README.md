# UWorld AI Tutor

Personalized AI MCAT tutor trained on your own UWorld notes — **Anki + ChatGPT + Khan Academy** for pre-med review.

Relearn any missed concept in under 2 minutes.

## Features (MVP)

- **Notes Library** — paste/upload UWorld explanations with subject, topic, tags
- **AI Tutor Chat** — RAG over your notes, Mermaid diagrams, KaTeX equations, mini quizzes
- **Quiz Mode** — easy / medium / MCAT-style questions with explanations
- **Weak Topics** — spaced repetition tracking for forgotten concepts
- **Analytics** — streaks, accuracy, subject breakdown, activity heatmap
- **Teach Before Practice** — pre-section high-yield summaries
- **Pomodoro timer** & study streak on dashboard

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | Next.js 15, React 19, Tailwind CSS 4, Framer Motion |
| Backend | Next.js API routes |
| Database | Supabase (PostgreSQL + pgvector) or localStorage fallback |
| AI | OpenAI API (chat + embeddings) |

## Quick Start (Local)

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Recommended | Powers AI tutor, quizzes, embeddings |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Cloud database |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase anon key |

**Without OpenAI:** the app runs with built-in demo responses (e.g. Bernoulli example).

**Without Supabase:** notes, quizzes, and streaks persist in browser `localStorage`.

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. (Optional) Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Add URL and anon key to `.env.local`
4. Restart the dev server

## Project Structure

```
src/
├── app/                    # Next.js App Router pages & API
│   ├── api/notes/          # Note CRUD + embeddings
│   ├── api/chat/           # AI tutor (RAG)
│   ├── api/quiz/           # Mini quiz generator
│   ├── api/teach-before/   # Pre-section summaries
│   ├── notes/              # Notes Library page
│   ├── tutor/              # AI Chat page
│   ├── quiz/               # Quiz Mode page
│   ├── weak-topics/        # Weak Topics dashboard
│   └── analytics/          # Analytics page
├── components/             # UI components
├── lib/
│   ├── openai/             # OpenAI client & prompts
│   ├── supabase/           # Supabase clients
│   ├── rag/                # Retrieval pipeline
│   ├── services/           # Business logic
│   └── storage/            # localStorage fallback
supabase/migrations/        # Database schema
```

## Scripts

```bash
npm run dev      # Development (Turbopack)
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```

## Roadmap

- [ ] Supabase Auth (replace demo user ID)
- [ ] Screenshot OCR (OpenAI Vision)
- [ ] Voice mode
- [ ] AI study plans
- [ ] PDF parsing for uploads

## License

MIT
