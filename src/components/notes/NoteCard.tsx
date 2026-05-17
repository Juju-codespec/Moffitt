"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MCAT_SUBJECTS } from "@/lib/constants/subjects";
import type { Note } from "@/lib/types";

export function NoteCard({ note, onDelete }: { note: Note; onDelete?: (id: string) => void }) {
  const subject = MCAT_SUBJECTS.find((s) => s.id === note.subject);
  return (
    <motion.article
      layout
      className="glass rounded-2xl p-4 hover:border-cyan-500/20 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-medium text-white">{note.title}</h3>
          <p className="mt-1 text-xs text-slate-500">
            {note.topic} · {note.uworld_section} · {note.difficulty}
          </p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="text-slate-600 hover:text-red-400"
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="mt-3 line-clamp-3 text-sm text-slate-400">{note.content}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {subject && <Badge color={subject.color}>{subject.label}</Badge>}
        {note.tags.map((t) => (
          <Badge key={t} className="text-slate-400">
            {t}
          </Badge>
        ))}
      </div>
    </motion.article>
  );
}
