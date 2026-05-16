#!/usr/bin/env node
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return {};
  const vars = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    vars[t.slice(0, i).trim()] = t.slice(i + 1).trim();
  }
  return vars;
}

const env = { ...loadEnv(), ...process.env };
const base = env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const model = env.OLLAMA_MODEL || "llama3.2";

console.log(`Checking Ollama at ${base} (model: ${model})...\n`);

try {
  const res = await fetch(`${base}/api/tags`);
  if (!res.ok) {
    console.error(`FAIL: Ollama returned HTTP ${res.status}`);
    process.exit(1);
  }
  const data = await res.json();
  const names = (data.models || []).map((m) => m.name);
  console.log("OK: Ollama is running");
  console.log("Installed models:", names.length ? names.join(", ") : "(none)");
  const has = names.some((n) => n === model || n.startsWith(`${model}:`));
  if (!has) {
    console.error(`\nFAIL: Model "${model}" not found. Run:\n  ollama pull ${model}`);
    process.exit(1);
  }
  console.log(`\nOK: Model "${model}" is ready. Start the site with: npm run dev`);
} catch (e) {
  console.error("FAIL: Cannot reach Ollama.");
  console.error("  1. Open the Ollama app (or run: ollama serve)");
  console.error(`  2. Run: ollama pull ${model}`);
  console.error("  3. Run this script again");
  if (e instanceof Error) console.error("\n ", e.message);
  process.exit(1);
}
