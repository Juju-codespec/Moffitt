"use client";

import { useEffect, useState } from "react";
import { NoteCaptureForm } from "@/components/notes/NoteCaptureForm";
import { NoteCard } from "@/components/notes/NoteCard";
import { SearchBar } from "@/components/ui/SearchBar";
import { SubjectFilter } from "@/components/ui/SubjectFilter";
import { getDemoUserId } from "@/lib/utils/user-id";
import { localNotesStore } from "@/lib/storage/local-notes";
import type { Note } from "@/lib/types";
import type { McatSubjectId } from "@/lib/constants/subjects";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState<McatSubjectId | "all">("all");

  function refresh() {
    const userId = getDemoUserId();
    setNotes(
      localNotesStore.search(
        userId,
        search,
        subject === "all" ? undefined : subject
      )
    );
  }

  useEffect(() => {
    const userId = getDemoUserId();
    setNotes(
      localNotesStore.search(
        userId,
        search,
        subject === "all" ? undefined : subject
      )
    );
  }, [search, subject]);

  function handleDelete(id: string) {
    localNotesStore.remove(id);
    refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notes Library</h1>
        <p className="text-sm text-slate-500">
          Paste or upload UWorld explanations — searchable & used by AI tutor.
        </p>
      </div>

      <NoteCaptureForm onSaved={refresh} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <SearchBar value={search} onChange={setSearch} className="flex-1" />
      </div>
      <SubjectFilter value={subject} onChange={setSubject} />

      <div className="grid gap-4 md:grid-cols-2">
        {notes.length === 0 ? (
          <p className="text-slate-500 col-span-2 text-center py-12">
            No notes yet. Capture your first UWorld miss above.
          </p>
        ) : (
          notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  );
}
