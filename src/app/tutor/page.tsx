import { ChatInterface } from "@/components/tutor/ChatInterface";

export default function TutorPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-white">AI Tutor</h1>
      <p className="mb-6 text-sm text-slate-500">
        Conversational MCAT tutoring powered by your notes + OpenAI.
      </p>
      <ChatInterface />
    </div>
  );
}
