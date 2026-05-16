export type SectionSlug =
  | "chem-phys"
  | "cars"
  | "bio-biochem"
  | "psych-soc";

export interface Subtopic {
  id: string;
  title: string;
  /** What “good enough” looks like before touching timed blocks */
  readinessChecks: string[];
  /** High-yield ideas to have mentally organized */
  conceptClusters: string[];
  /** Mistakes that waste QBank reps */
  commonTraps: string[];
}

export interface UWorldSection {
  slug: SectionSlug;
  shortTitle: string;
  title: string;
  tagline: string;
  description: string;
  accent: string;
  /** How UWorld-style blocks tend to feel */
  blockPreview: string[];
  subtopics: Subtopic[];
}

export const UWORLD_SECTIONS: UWorldSection[] = [
  {
    slug: "chem-phys",
    shortTitle: "Chem / Phys",
    title: "Chemical & Physical Foundations",
    tagline: "Physics, general chemistry, organic chemistry, biochemistry—applied to living systems.",
    description:
      "This section rewards fluent unit reasoning, mechanistic thinking, and translating graphs/equations into biological scenarios. Before blocks, prioritize dimensional analysis, equilibrium intuition, and recognizing when a question is really testing a principle versus arithmetic.",
    accent: "from-teal-500/20 to-cyan-500/10 ring-teal-500/30",
    blockPreview: [
      "Passages that hide the core relationship behind unfamiliar jargon",
      "Multi-step calculations where rounding discipline matters",
      "Figures where slope, intercept, or area carries the answer",
    ],
    subtopics: [
      {
        id: "fluids-electrochem",
        title: "Fluids, gases, electrochemistry",
        readinessChecks: [
          "Convert fluently between SI prefixes without calculator hesitation",
          "Explain pressure/volume/flow relationships in one sentence each",
          "Relate standard reduction potentials to spontaneous direction",
        ],
        conceptClusters: [
          "Ideal gas law + partial pressures",
          "Bernoulli continuity (qualitative)",
          "Nernst intuition (when concentrations shift potentials)",
          "Circuit basics for membrane/electrode analogies",
        ],
        commonTraps: [
          "Using the wrong R constant or forgetting temperature units",
          "Confusing Q vs K in equilibrium reasoning",
          "Treating electrochemistry like pure memorization—missing electron flow logic",
        ],
      },
      {
        id: "thermo-kinetics",
        title: "Thermodynamics & kinetics",
        readinessChecks: [
          "State the difference between ΔG, ΔG°, and equilibrium",
          "Predict effect of catalyst on rate vs thermodynamics",
          "Read activation energy from a reaction coordinate sketch",
        ],
        conceptClusters: [
          "Microstates / entropy directionality at a qualitative MCAT level",
          "Michaelis–Menten conceptual boundaries (Vmax, Km meanings)",
          "Half-life patterns for zero/first order (recognition)",
        ],
        commonTraps: [
          "Assuming exergonic always means fast",
          "Mixing up Keq expressions when stoichiometry changes",
          "Overfitting formulas instead of labeling axes first",
        ],
      },
      {
        id: "ochem-biochem-structure",
        title: "OChem mechanisms & biochem structure",
        readinessChecks: [
          "Identify nucleophile/electrophile roles in one pass",
          "Translate peptide bonds, α-helix/β-sheet implications",
          "Relate pH to protonation state for functional groups",
        ],
        conceptClusters: [
          "Substitutions vs eliminations (big-picture drivers)",
          "Carbonyl chemistry patterns relevant to metabolism",
          "Amino acid properties grouped by side chain chemistry",
          "Enzyme inhibition modes and graphical signatures",
        ],
        commonTraps: [
          "Memorizing reactions without stereochemical consequence",
          "Ignoring solvent/participant roles in mechanism prompts",
          "Confusing competitive vs noncompetitive inhibition graphs",
        ],
      },
    ],
  },
  {
    slug: "cars",
    shortTitle: "CARS",
    title: "Critical Analysis & Reasoning Skills",
    tagline: "Close reading, thesis evaluation, and disciplined inference—no outside science knowledge required.",
    description:
      "CARS is less about content and more about process: mapping arguments, separating evidence from conclusion, and avoiding ‘smart-sounding’ distractors. Prime with pacing templates and a repeatable passage workflow before timed practice.",
    accent: "from-violet-500/20 to-fuchsia-500/10 ring-violet-500/30",
    blockPreview: [
      "Dense humanities/social science prose with layered claims",
      "Questions that reward literal support over general knowledge",
      "Author tone and function questions that punish rushing",
    ],
    subtopics: [
      {
        id: "passage-architecture",
        title: "Passage architecture",
        readinessChecks: [
          "In 60 seconds, jot a 5–7 word thesis per paragraph",
          "Tag each paragraph’s job: background, claim, evidence, caveat, conclusion",
          "State the author’s main claim without importing outside facts",
        ],
        conceptClusters: [
          "Claim vs evidence vs implication",
          "Counterarguments and concessions",
          "Definitions used as pivots",
        ],
        commonTraps: [
          "Answering from memory or ‘truth’ instead of passage scope",
          "Choosing a true-but-irrelevant statement",
          "Over-inferring beyond supported language",
        ],
      },
      {
        id: "question-types",
        title: "Question types & distractors",
        readinessChecks: [
          "Recognize retrieval, inference, application, and strengthen/weaken frames",
          "Eliminate half-right answers by mismatching scope",
          "Prefer weaker precise language when tone matters",
        ],
        conceptClusters: [
          "Strong words vs guarded qualifiers",
          "Cause/effect vs correlation language",
          "New idea detection in ‘which of the following’ stems",
        ],
        commonTraps: [
          "Extreme answer choices that sound persuasive",
          "Reversals (supports vs undermines)",
          "Partial matches that ignore a negation in the stem",
        ],
      },
      {
        id: "pacing-review",
        title: "Pacing & review loops",
        readinessChecks: [
          "Know your target minutes/passage and checkpoints",
          "Have a flag-and-move rule that you actually follow",
          "Review misses by error type, not by frustration level",
        ],
        conceptClusters: [
          "Two-pass strategy for harder passages",
          "Blind review prompts: ‘what sentence bought the answer?’",
          "Tracking systematic vs careless misses separately",
        ],
        commonTraps: [
          "Re-reading entire passages under pressure",
          "Changing answers without new evidence",
          "Skipping reflection because ‘CARS is subjective’",
        ],
      },
    ],
  },
  {
    slug: "bio-biochem",
    shortTitle: "Bio / Biochem",
    title: "Biological & Biochemical Foundations",
    tagline: "Physiology, genetics, molecular biology, and metabolism integrated across scales.",
    description:
      "This section tests whether you can move between molecules, cells, tissues, and systems. Before blocks, lock in signaling hierarchies, genetics probability logic, and physiology graphs (pressure/volume curves, transport saturation).",
    accent: "from-emerald-500/20 to-lime-500/10 ring-emerald-500/30",
    blockPreview: [
      "Integrated pathways crossing organ systems",
      "Experimental passages with altered variables",
      "Figures combining genetics pedigrees with molecular rationale",
    ],
    subtopics: [
      {
        id: "cell-molecular",
        title: "Cell biology & molecular genetics",
        readinessChecks: [
          "Explain central dogma with regulation points",
          "Translate mutations into functional consequences quickly",
          "Describe checkpoint goals in plain language",
        ],
        conceptClusters: [
          "Chromatin regulation and transcription themes",
          "DNA repair conceptual buckets",
          "Meiosis vs mitosis decision rules",
          "Viruses/bacteria high-yield contrasts",
        ],
        commonTraps: [
          "Confusing template vs coding strand details under time pressure",
          "Misreading pedigree assumptions",
          "Ignoring upstream/downstream signaling context",
        ],
      },
      {
        id: "physiology",
        title: "Physiology & organ integration",
        readinessChecks: [
          "Sketch cardiac cycle phases with valve logic",
          "Explain filtration/reabsorption without memorizing every number",
          "Relate ventilation perfusion basics at a qualitative level",
        ],
        conceptClusters: [
          "Autonomic tone patterns",
          "Endocrine axes and feedback loops",
          "Kidney segments by transport theme",
          "Immune cell roles at a functional level",
        ],
        commonTraps: [
          "Treating physiology as lists instead of mechanisms",
          "Mixing up pressures/volumes on unfamiliar graphs",
          "Forgetting integration (e.g., exercise changes multiple variables)",
        ],
      },
      {
        id: "metabolism-lab",
        title: "Metabolism & laboratory reasoning",
        readinessChecks: [
          "Follow carbon/redox fate through glycolysis/TCA/oxphos at a bird’s-eye level",
          "Interpret Lineweaver–Burk style plots conceptually",
          "Connect enzyme assays to experimental manipulations",
        ],
        conceptClusters: [
          "Fasted vs fed regulation highlights",
          "Glycolysis/TCA connection points",
          "Electron carriers and proton motive force",
          "Basic separation/chromatography intuition",
        ],
        commonTraps: [
          "Getting lost in pathway minutiae vs principle questions",
          "Misreading competitive inhibition geometry",
          "Confusing experimental controls",
        ],
      },
    ],
  },
  {
    slug: "psych-soc",
    shortTitle: "Psych / Soc",
    title: "Psychological, Social & Biological Foundations",
    tagline: "Behavior, cognition, social structures, and statistics—applied to health contexts.",
    description:
      "This section blends vocabulary with scenario application. Before blocks, organize constructs into schemas (memory, learning, identity, social stratification) and build automaticity on research methods and statistic interpretation.",
    accent: "from-amber-500/20 to-orange-500/10 ring-amber-500/30",
    blockPreview: [
      "Scenario-heavy questions requiring construct discrimination",
      "Research design prompts where one violated assumption breaks validity",
      "Figures showing thresholds, discrimination, or association patterns",
    ],
    subtopics: [
      {
        id: "cognition-behavior",
        title: "Cognition, learning, motivation",
        readinessChecks: [
          "Define classical vs operant conditioning with examples",
          "Contrast memory stages and common biases",
          "Map theories of emotion/cognition at a ‘name + prediction’ level",
        ],
        conceptClusters: [
          "Schedules of reinforcement outcomes",
          "Attribution theory patterns",
          "Stress and coping frameworks",
          "Sleep/states of consciousness highlights",
        ],
        commonTraps: [
          "Vocabulary-only studying without scenario tagging",
          "Swapping similar constructs (e.g., conformity vs obedience)",
          "Ignoring definitions’ boundary conditions",
        ],
      },
      {
        id: "social-structure",
        title: "Social structures & identity",
        readinessChecks: [
          "Explain socioeconomic gradients without moralizing",
          "Differentiate prejudice, stereotype, discrimination operationally",
          "Summarize major agents of socialization quickly",
        ],
        conceptClusters: [
          "Culture, norms, institutions",
          "Health disparities framing at MCAT scope",
          "Demographics and life-course transitions",
          "Social determinants templates",
        ],
        commonTraps: [
          "Picking answers that sound ethical but aren’t supported",
          "Confusing correlation with structural explanation",
          "Overfitting US-centric assumptions onto generic stems",
        ],
      },
      {
        id: "methods-stats",
        title: "Research methods & statistics",
        readinessChecks: [
          "Identify IV/DV and operational definitions reliably",
          "Choose appropriate stats by measurement scale",
          "Interpret confidence intervals and p-values conceptually",
        ],
        conceptClusters: [
          "Validity vs reliability types",
          "Bias/error buckets",
          "Central tendency vs dispersion scenarios",
          "Basic probability rules used in genetics/psych passages",
        ],
        commonTraps: [
          "Confusing random assignment with random sampling",
          "Mixing up sensitivity/specificity intuition",
          "Calculator reflexes where conceptual elimination is faster",
        ],
      },
    ],
  },
];

export function getSection(slug: string): UWorldSection | undefined {
  return UWORLD_SECTIONS.find((s) => s.slug === slug);
}

export function isSectionSlug(s: string): s is SectionSlug {
  return UWORLD_SECTIONS.some((sec) => sec.slug === s);
}
