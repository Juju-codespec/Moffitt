"use client";

import { cn } from "@/lib/utils/cn";

/** 7-day activity heatmap for analytics */
export function ProgressHeatmap({ data }: { data: number[] }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const max = Math.max(...data, 1);

  return (
    <div className="flex gap-2">
      {data.map((count, i) => (
        <div key={i} className="flex flex-col items-center gap-1">
          <div
            className={cn(
              "h-8 w-8 rounded-lg transition-colors",
              count === 0 && "bg-white/5",
              count > 0 && count < max * 0.5 && "bg-cyan-500/30",
              count >= max * 0.5 && count < max && "bg-cyan-500/50",
              count >= max && "bg-cyan-500"
            )}
            title={`${count} activities`}
          />
          <span className="text-[10px] text-slate-600">{days[i]}</span>
        </div>
      ))}
    </div>
  );
}
