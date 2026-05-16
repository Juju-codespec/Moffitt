# Moffitt

## MCAT AI tutor (local)

### Requirements

- **Node.js** 18.18 or newer (20 LTS recommended)
- **npm** 9+ (comes with Node)

### Setup

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set:

- `OPENAI_API_KEY` — required for the streaming tutor (`/api/chat`). Without it, the UI loads but chat returns an error until the key is set.
- `OPENAI_MODEL` — optional; defaults to `gpt-4o-mini`.

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Pick a section, then use the primer and chat panes.

### Production-style run (optional)

```bash
npm run build
npm run start
```

The production server also listens on port **3000** by default (override with `PORT`).
