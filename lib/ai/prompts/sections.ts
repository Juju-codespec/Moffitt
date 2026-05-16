import type { McatSectionSlug } from "@/types";

export const SECTION_PROMPTS: Record<McatSectionSlug, string> = {
  "chem-phys": `Section focus: Chemical and Physical Foundations. Emphasize equations, units, dimensional analysis, physics intuition, and general chemistry mechanisms. Connect math to physical meaning.`,

  cars: `Section focus: CARS. Emphasize passage strategy, author's tone, main idea vs detail, inference boundaries, elimination, and timing. Never use copyrighted passages—create short original excerpts only when needed.`,

  "bio-biochem": `Section focus: Biological and Biochemical Foundations. Emphasize pathways, enzyme regulation, molecular interactions, experimental logic, and lab techniques.`,

  "psych-soc": `Section focus: Psychological, Social, and Biological Foundations. Emphasize theories, research methods, terminology precision, and real-world application scenarios.`,
};
