"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  AlertTriangle,
  Brain,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/notes", label: "Notes Library", icon: BookOpen },
  { href: "/tutor", label: "AI Tutor", icon: MessageSquare },
  { href: "/weak-topics", label: "Weak Topics", icon: AlertTriangle },
  { href: "/quiz", label: "Quiz Mode", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/10 glass-strong">
      <div className="flex h-16 items-center gap-2 border-b border-white/10 px-6">
        <Sparkles className="h-6 w-6 text-cyan-400" />
        <div>
          <p className="text-sm font-bold text-white">UWorld AI</p>
          <p className="text-xs text-slate-500">MCAT Tutor</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                active
                  ? "bg-cyan-500/15 text-cyan-300 shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <p className="p-4 text-xs text-slate-600">
        Relearn any UWorld miss in &lt;2 min
      </p>
    </aside>
  );
}
