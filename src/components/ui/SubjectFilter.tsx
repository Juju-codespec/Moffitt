"use client";

import { MCAT_SUBJECTS, type McatSubjectId } from "@/lib/constants/subjects";
import { cn } from "@/lib/utils/cn";

export function SubjectFilter({
  value,
  onChange,
}: {
  value: McatSubjectId | "all";
  onChange: (v: McatSubjectId | "all") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "rounded-full px-3 py-1 text-xs font-medium transition-all",
          value === "all"
            ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40"
            : "glass text-slate-400 hover:text-slate-200"
        )}
      >
        All
      </button>
      {MCAT_SUBJECTS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onChange(s.id)}
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium transition-all",
            value === s.id ? "ring-1" : "glass text-slate-400 hover:text-slate-200"
          )}
          style={
            value === s.id
              ? {
                  backgroundColor: `${s.color}22`,
                  color: s.color,
                  borderColor: `${s.color}44`,
                }
              : undefined
          }
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
