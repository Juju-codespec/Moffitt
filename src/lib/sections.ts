export type SectionId = "cp" | "bb" | "ps" | "cars";

export interface Topic {
  id: string;
  title: string;
  summary: string;
  qbankReadiness: string[];
}

export interface Section {
  id: SectionId;
  name: string;
  shortName: string;
  uworldLabel: string;
  description: string;
  color: "cp" | "bb" | "ps" | "cars";
  preQbankGoal: string;
  topics: Topic[];
  starterPrompts: string[];
}

export const SECTIONS: Record<SectionId, Section> = {
  cp: {
    id: "cp",
    name: "Chemical & Physical Foundations",
    shortName: "C/P",
    uworldLabel: "UWorld C/P",
    description:
      "Build fluency in gen chem, org chem, physics, and biochem math before timed passages.",
    color: "cp",
    preQbankGoal:
      "You can set up problems, track units, and predict what equations apply without guessing.",
    topics: [
      {
        id: "units-dimensions",
        title: "Units, dimensions & estimation",
        summary:
          "Dimensional analysis, SI units, orders of magnitude, and sanity-checking answers.",
        qbankReadiness: [
          "Convert units without a formula sheet",
          "Spot wrong-answer traps from unit mismatches",
        ],
      },
      {
        id: "gen-chem",
        title: "General chemistry core",
        summary:
          "Stoichiometry, equilibrium, acids/bases, thermochemistry, electrochemistry.",
        qbankReadiness: [
          "ICE tables and Ka/Kb reasoning",
          "ΔG, ΔH, ΔS relationships in one line",
        ],
      },
      {
        id: "org-chem",
        title: "Organic chemistry patterns",
        summary:
          "Functional groups, stereochemistry, reactions, and spectroscopy logic.",
        qbankReadiness: [
          "Predict products from reagent sets",
          "Read NMR/IR trends at MCAT depth",
        ],
      },
      {
        id: "physics",
        title: "Physics for the MCAT",
        summary:
          "Kinematics, forces, fluids, circuits, optics, and waves at conceptual depth.",
        qbankReadiness: [
          "Draw free-body diagrams quickly",
          "Series/parallel and fluid continuity intuition",
        ],
      },
      {
        id: "biochem-math",
        title: "Biochem-linked quantitative skills",
        summary:
          "Enzyme kinetics, buffers, pH/pKa, and lab-style data interpretation.",
        qbankReadiness: [
          "Michaelis–Menten and Lineweaver–Burk meaning",
          "Henderson–Hasselbalch without memorizing blindly",
        ],
      },
    ],
    starterPrompts: [
      "Teach me dimensional analysis with one C/P-style example.",
      "What must I know about acids and bases before UWorld C/P?",
      "Walk me through a circuits problem step by step.",
    ],
  },
  bb: {
    id: "bb",
    name: "Biological & Biochemical Foundations",
    shortName: "B/B",
    uworldLabel: "UWorld B/B",
    description:
      "Master pathways, molecular biology, and experimental logic so passages feel familiar.",
    color: "bb",
    preQbankGoal:
      "You can trace metabolism, genetics, and organ systems and explain experiments in plain language.",
    topics: [
      {
        id: "amino-acids",
        title: "Amino acids & protein structure",
        summary:
          "Properties, levels of structure, folding, and how sequence drives function.",
        qbankReadiness: [
          "Classify amino acids by side chain at a glance",
          "Link structure changes to function loss",
        ],
      },
      {
        id: "enzymes-metabolism",
        title: "Enzymes & central metabolism",
        summary:
          "Glycolysis, gluconeogenesis, TCA, ETC, regulation, and key inhibitors/activators.",
        qbankReadiness: [
          "Draw net ATP/NADH per pathway",
          "Explain allosteric vs covalent regulation",
        ],
      },
      {
        id: "molecular-bio",
        title: "Molecular biology & genetics",
        summary:
          "Replication, transcription, translation, mutations, and inheritance patterns.",
        qbankReadiness: [
          "Predict mutation effects on protein",
          "Punnett squares and pedigree logic",
        ],
      },
      {
        id: "organs-systems",
        title: "Organ systems integration",
        summary:
          "Cardiovascular, renal, respiratory, endocrine, and immune at MCAT depth.",
        qbankReadiness: [
          "Connect hormone → target → outcome",
          "Explain homeostasis feedback loops",
        ],
      },
      {
        id: "experiments",
        title: "Experimental design & data",
        summary:
          "Controls, variables, assays, and reading figures in bio/biochem passages.",
        qbankReadiness: [
          "Name control vs experimental groups",
          "Interpret Western/blot/kinetic graphs",
        ],
      },
    ],
    starterPrompts: [
      "Quiz me on amino acid properties before I start B/B QBank.",
      "Explain glycolysis vs gluconeogenesis for MCAT level.",
      "How do I read a genetics experiment passage efficiently?",
    ],
  },
  ps: {
    id: "ps",
    name: "Psychological, Social & Biological Foundations",
    shortName: "P/S",
    uworldLabel: "UWorld P/S",
    description:
      "Lock in terminology, theories, and research methods so answer choices map to concepts.",
    color: "ps",
    preQbankGoal:
      "You recognize theories, biases, and study designs and can eliminate distractors by definition.",
    topics: [
      {
        id: "biology-behavior",
        title: "Biological bases of behavior",
        summary:
          "Brain regions, neurotransmitters, sleep, stress, and sensation/perception basics.",
        qbankReadiness: [
          "Match neurotransmitter to function",
          "Apply localization of brain function",
        ],
      },
      {
        id: "learning-memory",
        title: "Learning, memory & cognition",
        summary:
          "Classical/operant conditioning, memory models, language, and problem solving.",
        qbankReadiness: [
          "Distinguish conditioning types in scenarios",
          "Apply working vs long-term memory frameworks",
        ],
      },
      {
        id: "personality-social",
        title: "Personality, identity & social psych",
        summary:
          "Theories, attribution, conformity, prejudice, and group behavior.",
        qbankReadiness: [
          "Map scenarios to named theories",
          "Spot fundamental attribution error",
        ],
      },
      {
        id: "sociology",
        title: "Sociology & demographics",
        summary:
          "Stratification, institutions, culture, health disparities, and social structure.",
        qbankReadiness: [
          "Define key terms precisely (not colloquially)",
          "Link structure to health outcomes",
        ],
      },
      {
        id: "research-methods",
        title: "Research methods & statistics",
        summary:
          "Study types, validity, reliability, bias, and basic stats interpretation.",
        qbankReadiness: [
          "Choose best study design for a question",
          "Interpret correlation vs causation traps",
        ],
      },
    ],
    starterPrompts: [
      "Drill me on classical vs operant conditioning with examples.",
      "What P/S terms do students confuse most before QBank?",
      "Explain validity vs reliability for the MCAT.",
    ],
  },
  cars: {
    id: "cars",
    name: "Critical Analysis & Reasoning Skills",
    shortName: "CARS",
    uworldLabel: "UWorld CARS",
    description:
      "Train passage mapping, question types, and timing habits before full timed sets.",
    color: "cars",
    preQbankGoal:
      "You read for structure, predict questions, and justify answers with passage evidence only.",
    topics: [
      {
        id: "passage-mapping",
        title: "Passage mapping & main idea",
        summary:
          "Paragraph roles, thesis, tone, and annotating without over-highlighting.",
        qbankReadiness: [
          "Summarize each paragraph in one phrase",
          "State main idea in one sentence under time",
        ],
      },
      {
        id: "question-types",
        title: "Question types & strategies",
        summary:
          "Main idea, inference, strengthen/weaken, tone, and application questions.",
        qbankReadiness: [
          "Tag question type before reading choices",
          "Eliminate outside-knowledge answers",
        ],
      },
      {
        id: "timing",
        title: "Timing & endurance",
        summary:
          "Pacing (~10 min/passage), triage, and when to flag and move on.",
        qbankReadiness: [
          "Finish 9 passages with 2–3 min review buffer",
          "Never spend 3+ min on one question early",
        ],
      },
      {
        id: "reasoning-traps",
        title: "Logic traps & extreme answers",
        summary:
          "Scope shifts, causal leaps, absolute language, and dual-passage comparisons.",
        qbankReadiness: [
          "Reject choices that go beyond the passage",
          "Compare two passages by disagreement axis",
        ],
      },
    ],
    starterPrompts: [
      "Teach me passage mapping for humanities passages.",
      "How should I approach inference questions before QBank?",
      "Give me a 5-minute CARS warm-up routine.",
    ],
  },
};

export function getSection(id: string): Section | undefined {
  return SECTIONS[id as SectionId];
}

export const SECTION_LIST = Object.values(SECTIONS);
