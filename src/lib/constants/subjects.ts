/** MCAT subject taxonomy for tagging and filtering */
export const MCAT_SUBJECTS = [
  { id: "bio", label: "Biology", color: "#34d399" },
  { id: "biochem", label: "Biochemistry", color: "#22d3ee" },
  { id: "chem", label: "Chemistry", color: "#fbbf24" },
  { id: "physics", label: "Physics", color: "#a78bfa" },
  { id: "psych", label: "Psych/Soc", color: "#f472b6" },
  { id: "cars", label: "CARS", color: "#94a3b8" },
] as const;

export type McatSubjectId = (typeof MCAT_SUBJECTS)[number]["id"];

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

export const UWORLD_SECTIONS = [
  "Biochemistry",
  "Biology",
  "General Chemistry",
  "Organic Chemistry",
  "Physics",
  "Psychology",
  "CARS",
  "Mixed",
] as const;
