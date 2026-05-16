export type McatSectionSlug =
  | "chem-phys"
  | "cars"
  | "bio-biochem"
  | "psych-soc";

export type BriefingMode = "full" | "high_yield" | "cram";

export type ChatMode =
  | "concept"
  | "socratic"
  | "passage"
  | "equation"
  | "cars"
  | "error_review"
  | "teach_back";

export interface TopicMetadata {
  equations?: string[];
  trap_patterns?: string[];
  passage_archetypes?: string[];
  reasoning_patterns?: string[];
  prerequisiteTopics?: string[];
}

export interface McatSection {
  id: string;
  slug: McatSectionSlug;
  name: string;
  sort_order: number;
}

export interface McatTopic {
  id: string;
  section_id: string;
  section_slug: McatSectionSlug;
  slug: string;
  name: string;
  parent_topic_id: string | null;
  sort_order: number;
  metadata: TopicMetadata;
  subtopics?: { name: string; high_yield: boolean }[];
}

export interface ReadinessSubscores {
  content: number;
  equations: number;
  passage: number;
  timing: number;
  weak_subskills: string[];
}

export interface BeforeYouStartBriefing {
  overview: string;
  commonStruggles: string[];
  coreConcepts: {
    name: string;
    summary: string;
    priority: "critical" | "high" | "medium";
  }[];
  equations: {
    name: string;
    formula: string;
    whenToUse: string;
    pitfalls: string;
  }[];
  patternRecognition: string[];
  passageTips: string[];
  timing: {
    recommendedPace: string;
    flaggingStrategy: string;
  };
  traps: {
    trap: string;
    whyTempting: string;
    howToAvoid: string;
  }[];
  reasoningShortcuts: string[];
  prerequisites: { topicSlug: string; reason: string }[];
  confidenceChecklist: { item: string; selfRateHint: string }[];
  openingCoachMessage: string;
}

export interface QuizQuestion {
  id: string;
  stem: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
  concept: string;
}

export interface UserTopicProgress {
  topic_id: string;
  readiness_score: number;
  subscores: ReadinessSubscores;
  last_studied_at: string | null;
}

export interface Profile {
  id: string;
  display_name: string | null;
  exam_date: string | null;
  target_score: number | null;
  study_hours_per_week: number | null;
  preferences: Record<string, unknown>;
}
