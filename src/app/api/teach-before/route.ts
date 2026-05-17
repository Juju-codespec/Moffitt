import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getOpenAI } from "@/lib/openai/client";

const schema = z.object({
  section: z.string().min(1),
  subject: z.string().optional(),
});

/** POST /api/teach-before — pre-section concept summary */
export async function POST(req: NextRequest) {
  try {
    const { section, subject } = schema.parse(await req.json());
    const openai = getOpenAI();

    if (!openai) {
      return NextResponse.json({
        summary: getMockTeachBefore(section),
      });
    }

    const res = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an MCAT tutor. Before the student starts UWorld "${section}" (${subject ?? ""}), provide:
## Foundational Concepts (bullet list)
## High-Yield Equations
## Must-Know Traps
## Commonly Tested Patterns
## Recommended UWorld Strategy
Keep it concise and scannable in markdown.`,
        },
        { role: "user", content: `Teach me before I start: ${section}` },
      ],
      temperature: 0.5,
      max_tokens: 1500,
    });

    return NextResponse.json({
      summary: res.choices[0]?.message?.content ?? getMockTeachBefore(section),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function getMockTeachBefore(section: string): string {
  if (section.toLowerCase().includes("fluid")) {
    return `## Foundational Concepts
- Bernoulli: fast flow → lower pressure
- Continuity: $A_1 v_1 = A_2 v_2$
- Hydrostatic: $P = P_0 + \\rho g h$
- Buoyancy: $F_b = \\rho_{fluid} V g$
- Venturi effect: constriction ↑ speed ↓ pressure

## High-Yield Equations
$$P + \\frac{1}{2}\\rho v^2 + \\rho g h = \\text{constant}$$

## Must-Know Traps
- Pressure ≠ force
- Gauge vs absolute pressure

## Commonly Tested Patterns
- Pipe narrowing problems
- Floating/sinking objects

## Recommended UWorld Strategy
Do 5 questions timed, review ALL misses into Notes, then run Teach Before check on weak tags.`;
  }

  return `## Foundational Concepts
Review core equations and definitions for **${section}** before timed blocks.

## High-Yield Equations
Add your own from missed UWorld questions.

## Must-Know Traps
Track traps in Notes Library tags.

## Commonly Tested Patterns
Pattern recognition beats memorizing isolated facts.

## Recommended UWorld Strategy
Untimed review → capture notes → timed block → AI tutor recall.`;
}
