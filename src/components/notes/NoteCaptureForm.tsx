"use client";

import { useState } from "react";
import { Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import {
  MCAT_SUBJECTS,
  UWORLD_SECTIONS,
  DIFFICULTY_LEVELS,
  type McatSubjectId,
  type DifficultyLevel,
} from "@/lib/constants/subjects";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localNotesStore } from "@/lib/storage/local-notes";
import type { Note } from "@/lib/types";

export function NoteCaptureForm({ onSaved }: { onSaved?: (note: Note) => void }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subject, setSubject] = useState<McatSubjectId>("bio");
  const [topic, setTopic] = useState("");
  const [uworldSection, setUworldSection] = useState<string>(UWORLD_SECTIONS[0]);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("medium");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;
    setSaving(true);
    const userId = getDemoUserId();
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          title,
          content,
          subject,
          topic,
          uworld_section: uworldSection,
          difficulty,
          tags: tagList,
        }),
      });
      const data = await res.json();
      const note =
        data.note ??
        localNotesStore.upsert({
          user_id: userId,
          title,
          content,
          subject,
          topic,
          uworld_section: uworldSection,
          difficulty,
          tags: tagList,
        });
      if (!data.note) {
        // API may fail without Supabase — ensure local save
        localNotesStore.upsert({
          user_id: userId,
          title,
          content,
          subject,
          topic,
          uworld_section: uworldSection,
          difficulty,
          tags: tagList,
          id: note.id,
        });
      }
      setTitle("");
      setContent("");
      setTopic("");
      setTags("");
      onSaved?.(note);
    } finally {
      setSaving(false);
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setContent((c) => (c ? `${c}\n\n${text}` : text));
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    };
    reader.readAsText(file);
  }

  return (
    <GlassCard strong>
      <h2 className="mb-4 text-lg font-semibold text-white">Capture UWorld Notes</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-slate-500">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bernoulli — pipe narrowing"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Subject</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value as McatSubjectId)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {MCAT_SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Topic</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Fluids, Enzymes..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">UWorld Section</label>
          <select
            value={uworldSection}
            onChange={(e) => setUworldSection(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {UWORLD_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500">Difficulty</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          >
            {DIFFICULTY_LEVELS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-slate-500">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="bernoulli, fluids, trap"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-slate-500">Notes (paste from UWorld)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Paste explanation, equations, why you missed it..."
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <label className="cursor-pointer">
          <input type="file" accept=".txt,.md,.pdf" className="hidden" onChange={handleFile} />
          <span className="inline-flex items-center gap-2 rounded-xl glass px-4 py-2 text-sm text-slate-300 hover:text-white">
            <Upload className="h-4 w-4" /> Upload file
          </span>
        </label>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Note"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-slate-600">
        Screenshot OCR & PDF parsing: connect OpenAI Vision in production.
      </p>
    </GlassCard>
  );
}
