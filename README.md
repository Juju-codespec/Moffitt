# Moffitt — Local MCAT Tutor

A **pre-QBank** MCAT tutor that specializes by **UWorld section** (C/P, B/B, P/S, CARS). It explains foundational concepts, highlights QBank readiness skills, and chats with you via a **local LLM** (Ollama).

## Features

- **Four section hubs** aligned with UWorld: Chemical/Physical, Bio/Biochem, Psych/Soc, and CARS
- **Pre-QBank topic roadmaps** with readiness checklists per topic
- **Section-tuned AI tutor** (system prompts per section, topic context in chat)
- **Runs locally** with [Ollama](https://ollama.com) (default) or optional OpenAI API

## Quick start

### 1. Install Ollama

```bash
# macOS / Linux — see https://ollama.com/download
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2
```

Keep Ollama running (`ollama serve` starts automatically on most installs).

### 2. Run the app

```bash
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:3000**, pick a section, select a topic, and chat.

### 3. Health check

The header shows LLM status (green = ready). You can also hit:

```bash
curl http://localhost:3000/api/health
```

## Configuration (`.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `LLM_PROVIDER` | `ollama` | `ollama` or `openai` |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Ollama API URL |
| `OLLAMA_MODEL` | `llama3.2` | Model name (`ollama pull …`) |
| `OPENAI_API_KEY` | — | Required if `LLM_PROVIDER=openai` |
| `OPENAI_MODEL` | `gpt-4o-mini` | OpenAI model name |

### Recommended local models

- **General:** `llama3.2`, `mistral`, `qwen2.5`
- **Stronger reasoning (more VRAM):** `llama3.1:70b`, `qwen2.5:14b`

```bash
ollama pull qwen2.5:7b
# then set OLLAMA_MODEL=qwen2.5:7b in .env
```

## Project structure

```
src/
  lib/sections.ts   # UWorld sections, topics, readiness skills
  lib/prompts.ts    # Section-specific tutor system prompts
  lib/llm.ts        # Ollama + OpenAI streaming
  app/              # Next.js pages & API routes
  components/       # UI
```

## Disclaimer

This app does **not** include UWorld questions or copyrighted content. It teaches concepts and strategies to prepare you **before** you start third-party QBank. Use your licensed materials for practice questions.

## Scripts

- `npm run dev` — development server
- `npm run build` / `npm start` — production
- `npm run lint` — ESLint
