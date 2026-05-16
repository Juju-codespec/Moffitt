import Link from "next/link";
import type { Section } from "@/lib/sections";

const colorMap = {
  cp: {
    border: "border-accent-cp/40 hover:border-accent-cp",
    badge: "bg-accent-cp/15 text-accent-cp",
    glow: "hover:shadow-[0_0_32px_rgba(56,189,248,0.12)]",
  },
  bb: {
    border: "border-accent-bb/40 hover:border-accent-bb",
    badge: "bg-accent-bb/15 text-accent-bb",
    glow: "hover:shadow-[0_0_32px_rgba(74,222,128,0.12)]",
  },
  ps: {
    border: "border-accent-ps/40 hover:border-accent-ps",
    badge: "bg-accent-ps/15 text-accent-ps",
    glow: "hover:shadow-[0_0_32px_rgba(192,132,252,0.12)]",
  },
  cars: {
    border: "border-accent-cars/40 hover:border-accent-cars",
    badge: "bg-accent-cars/15 text-accent-cars",
    glow: "hover:shadow-[0_0_32px_rgba(251,146,60,0.12)]",
  },
};

export function SectionCard({ section }: { section: Section }) {
  const c = colorMap[section.color];

  return (
    <Link
      href={`/section/${section.id}`}
      className={`group block rounded-2xl border bg-surface-raised p-6 transition-all ${c.border} ${c.glow}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${c.badge}`}
        >
          {section.shortName}
        </span>
        <span className="text-sm text-slate-500">{section.uworldLabel}</span>
      </div>
      <h2 className="mb-2 text-xl font-semibold text-white">{section.name}</h2>
      <p className="mb-4 text-sm leading-relaxed text-slate-400">
        {section.description}
      </p>
      <p className="text-xs text-slate-500">
        {section.topics.length} pre-QBank topics · Start studying →
      </p>
    </Link>
  );
}
