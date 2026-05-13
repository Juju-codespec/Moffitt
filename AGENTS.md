# AGENTS.md

## Cursor Cloud specific instructions

This is a Vite + React + TypeScript single-page application (no backend). All data is persisted in browser `localStorage`.

### Quick reference

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Dev server | `npm run dev` (serves at http://localhost:5173) |
| Type check | `npx tsc -b` |
| Production build | `npm run build` |

### Notes

- There is no linter, formatter, or test framework configured in this project. TypeScript compilation (`tsc -b`) is the only static analysis available.
- No environment variables or `.env` file are required.
- No external services (databases, APIs, auth providers) are needed — everything runs client-side.
- The auth system is demo-only: any name/email/role combination is accepted via the login form (no password).
- The dev server supports `--host 0.0.0.0` for network access within the VM.
