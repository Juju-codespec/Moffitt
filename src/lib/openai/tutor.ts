import { getOpenAI } from "./client";

export const TUTOR_SYSTEM_PROMPT = `You are UWorld AI Tutor — a personalized MCAT tutor trained on the student's own UWorld notes.

Rules:
- Be concise first; expand only when asked
- Focus on MCAT relevance and pattern recognition
- Use active recall: end with a mini quiz when teaching a concept
- Include memory tricks and common traps
- Use LaTeX for equations: inline $...$ and block $$...$$
- When a diagram helps, include a mermaid code block with language "mermaid"
- Structure responses in markdown with these sections when teaching:
  ## Concept
  ## High-Yield Summary
  ## Key Equation (if applicable)
  ## MCAT Memory Trick
  ## Visual (mermaid diagram)
  ## Common Trap
  ## Mini Quiz (4 options, mark correct with **Correct Answer: X**)
  ## Confidence Check (ask student to rate 1-5)

For "explain simpler" requests, use analogies and simpler language.
For weak-subject mode, assume zero prior knowledge and build up slowly.`;

export interface TutorContextNote {
  title: string;
  content: string;
  subject: string;
  topic: string;
}

/** Stream or complete tutor response with RAG context */
export async function generateTutorReply(
  messages: { role: "user" | "assistant"; content: string }[],
  contextNotes: TutorContextNote[],
  options?: { simplify?: boolean; weakSubject?: string }
): Promise<string> {
  const openai = getOpenAI();
  if (!openai) {
    return getMockTutorReply(messages[messages.length - 1]?.content ?? "");
  }

  const contextBlock =
    contextNotes.length > 0
      ? `\n\n--- STUDENT NOTES (use these as primary source) ---\n${contextNotes
          .map(
            (n) =>
              `[${n.subject}/${n.topic}] ${n.title}:\n${n.content.slice(0, 1500)}`
          )
          .join("\n\n")}`
      : "";

  let system = TUTOR_SYSTEM_PROMPT + contextBlock;
  if (options?.simplify) {
    system += "\n\nThe student asked for a SIMPLER explanation. Use analogies and shorter sentences.";
  }
  if (options?.weakSubject) {
    system += `\n\nThe student is weak at ${options.weakSubject}. Assume minimal background knowledge.`;
  }

  const res = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.6,
    max_tokens: 2000,
  });

  return res.choices[0]?.message?.content ?? "I couldn't generate a response. Please try again.";
}

/** Demo response when OpenAI key is missing */
function getMockTutorReply(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  if (lower.includes("bernoulli")) {
    return `## Concept
Bernoulli Principle

## High-Yield Summary
As fluid speed **increases**, **pressure decreases** (for incompressible, ideal flow along a streamline).

## Key Equation
$$P + \\frac{1}{2}\\rho v^2 + \\rho g h = \\text{constant}$$

## MCAT Memory Trick
**"Fast fluid = less pushing pressure."**

## Visual
\`\`\`mermaid
flowchart LR
  A["Wide pipe\\nSlow v\\nHigh P"] --> B["Narrow pipe\\nFast v\\nLow P"]
\`\`\`

## Common Trap
Students confuse **pressure** with **force** — pressure is force per unit area.

## Mini Quiz
Why does airplane wing lift occur?

A) Faster air above wing lowers pressure  
B) Faster air above wing raises pressure  
C) Pressure is unrelated to velocity  
D) Gravity increases air speed  

**Correct Answer: A**

## Confidence Check
Rate your confidence 1–5 on Bernoulli before moving on.`;
  }

  return `## Concept
${userMessage.slice(0, 80)}

## High-Yield Summary
Add your UWorld notes in the **Notes Library** so I can teach from *your* missed questions. With \`OPENAI_API_KEY\` set, I'll personalize answers using RAG over your notes.

## MCAT Memory Trick
Active recall beats passive re-reading — quiz yourself after each explanation.

## Mini Quiz
What's the best next step after missing a UWorld question?

A) Skim the explanation once  
B) Capture notes and quiz the concept within 24h  
C) Only redo the question bank  
D) Ignore until full-length exams  

**Correct Answer: B**

## Confidence Check
How confident are you (1–5) on this topic?`;
}
