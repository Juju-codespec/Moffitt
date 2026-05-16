import type { McatSection, McatTopic, McatSectionSlug } from "@/types";
import chemPhys from "@/content/sections/chem-phys.json";
import cars from "@/content/sections/cars.json";
import bioBiochem from "@/content/sections/bio-biochem.json";
import psychSoc from "@/content/sections/psych-soc.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sectionFiles: Record<McatSectionSlug, any> = {
  "chem-phys": chemPhys,
  cars: cars,
  "bio-biochem": bioBiochem,
  "psych-soc": psychSoc,
};

const SECTION_IDS: Record<McatSectionSlug, string> = {
  "chem-phys": "sec-chem-phys",
  cars: "sec-cars",
  "bio-biochem": "sec-bio-biochem",
  "psych-soc": "sec-psych-soc",
};

function slugToId(slug: string) {
  return `topic-${slug}`;
}

export function getAllSections(): McatSection[] {
  return (Object.keys(sectionFiles) as McatSectionSlug[]).map((slug, i) => ({
    id: SECTION_IDS[slug],
    slug,
    name: sectionFiles[slug].section.name,
    sort_order: sectionFiles[slug].section.sort_order ?? i,
  }));
}

export function getSectionBySlug(slug: McatSectionSlug) {
  return getAllSections().find((s) => s.slug === slug);
}

export function getTopicsBySection(slug: McatSectionSlug): McatTopic[] {
  const file = sectionFiles[slug];
  const sectionId = SECTION_IDS[slug];
  return file.topics.map((t: Omit<McatTopic, "id" | "section_id">, i: number) => ({
    id: slugToId(t.slug),
    section_id: sectionId,
    section_slug: slug,
    slug: t.slug,
    name: t.name,
    parent_topic_id: t.parent_topic_id ?? null,
    sort_order: t.sort_order ?? i,
    metadata: t.metadata ?? {},
    subtopics: t.subtopics,
  }));
}

export function getTopicBySlug(sectionSlug: McatSectionSlug, topicSlug: string) {
  return getTopicsBySection(sectionSlug).find((t) => t.slug === topicSlug);
}

export function getTopicById(topicId: string) {
  for (const slug of Object.keys(sectionFiles) as McatSectionSlug[]) {
    const topic = getTopicsBySection(slug).find((t) => t.id === topicId);
    if (topic) return topic;
  }
  return undefined;
}

export function getSectionSlugForTopicId(topicId: string): McatSectionSlug | undefined {
  const topic = getTopicById(topicId);
  return topic?.section_slug;
}
