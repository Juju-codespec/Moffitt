"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChatPanel } from "@/components/tutor/chat-panel";

function TutorContent() {
  const params = useSearchParams();
  const topicId = params.get("topicId") ?? undefined;
  const section = params.get("section") ?? undefined;

  return (
    <div className="p-6 md:p-8">
      <h1 className="mb-2 text-2xl font-bold">AI Tutor</h1>
      <p className="mb-6 text-sm text-zinc-400">
        Socratic coaching, teach-back, passage strategy, and error review — AAMC
        logic first.
      </p>
      <ChatPanel topicId={topicId} section={section} />
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading tutor...</div>}>
      <TutorContent />
    </Suspense>
  );
}
