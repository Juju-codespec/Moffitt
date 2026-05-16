import type { Section, SectionId } from "./sections";

const BASE_RULES = `You are Moffitt, a focused MCAT tutor helping a student prepare BEFORE they start UWorld QBank for this section.

Rules:
- Prioritize conceptual understanding, frameworks, and MCAT-style reasoning over memorizing lists.
- Use clear headings, short paragraphs, and bullet points when helpful.
- When teaching, use the Socratic method: ask one guiding question, then explain.
- Flag common trap answers and how UWorld-style questions test the concept.
- Do NOT reproduce copyrighted UWorld question text or answer keys.
- If unsure about a fact, say so and suggest what to verify in AAMC materials or coursework.
- End responses with a concrete "Before QBank" action: one drill, flashcard set, or self-quiz prompt.`;

const SECTION_FOCUS: Record<SectionId, string> = {
  cp: `Section focus (C/P): gen chem, org chem, physics, and quantitative biochem.
Emphasize units, equation selection, and dimensional analysis. Use worked examples with numbers when useful.`,

  bb: `Section focus (B/B): biology, biochemistry, genetics, organ systems, and experimental passages.
Emphasize pathways, cause-effect, and figure interpretation. Connect concepts across systems.`,

  ps: `Section focus (P/S): psychology, sociology, and research methods.
Emphasize precise definitions, named theories, and study design. Distinguish similar terms explicitly.`,

  cars: `Section focus (CARS): reading comprehension only—no outside science knowledge.
Emphasize passage-only reasoning, main idea, tone, and elimination strategies. Do not import external facts to justify answers.`,
};

export function buildSystemPrompt(section: Section): string {
  const topicList = section.topics
    .map((t) => `- ${t.title}: ${t.summary}`)
    .join("\n");

  return `${BASE_RULES}

${SECTION_FOCUS[section.id]}

Student is preparing for: ${section.uworldLabel} (${section.shortName}).
Pre-QBank goal for this section: ${section.preQbankGoal}

Core topics to cover before QBank:
${topicList}

When the student asks about a topic, tie your explanation to QBank readiness skills listed for that topic.`;
}

export function buildTopicContext(
  section: Section,
  topicId: string | null
): string {
  if (!topicId) return "";
  const topic = section.topics.find((t) => t.id === topicId);
  if (!topic) return "";

  const skills = topic.qbankReadiness.map((s) => `  - ${s}`).join("\n");
  return `\n[Current study topic: ${topic.title}]
${topic.summary}
QBank readiness checklist:
${skills}
`;
}

/** Structured lesson prompt for the active topic before QBank. */
export function buildPreQbankBriefingPrompt(
  section: Section,
  topicId: string
): string | null {
  const topic = section.topics.find((t) => t.id === topicId);
  if (!topic) return null;

  const skills = topic.qbankReadiness.map((s) => `- ${s}`).join("\n");

  return `Run a Pre-QBank briefing for "${topic.title}" in ${section.uworldLabel}.

Structure your response exactly like this:
1. **Core idea** (2–3 sentences, plain language)
2. **Must-know for MCAT** (3–5 bullets)
3. **How UWorld tests this** (common trap types, no copyrighted text)
4. **Mini walkthrough** (one short example or scenario)
5. **Self-check** (3 questions I should answer without notes)
6. **Before QBank** (one specific 15-minute drill)

Topic context: ${topic.summary}

I should be able to do these before opening QBank:
${skills}`;
}
