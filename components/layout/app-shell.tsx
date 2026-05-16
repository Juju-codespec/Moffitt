"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Brain,
  Calendar,
  Settings,
  Flame,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sections/chem-phys", label: "Sections", icon: BookOpen },
  { href: "/tutor", label: "AI Tutor", icon: MessageSquare },
  { href: "/cars", label: "CARS Coach", icon: Brain },
  { href: "/study-plan", label: "Study Plan", icon: Calendar },
  { href: "/practice", label: "Practice", icon: Timer },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="hidden w-64 flex-shrink-0 border-r border-zinc-800/80 bg-zinc-950/90 p-4 md:flex md:flex-col">
        <Link href="/dashboard" className="mb-8 block px-2">
          <span className="text-lg font-bold tracking-tight text-emerald-400">
            Pre-QBank
          </span>
          <span className="mt-0.5 block text-xs text-zinc-500">
            MCAT Strategic Tutor
          </span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-xs text-zinc-400">
          <Flame className="h-4 w-4 text-amber-400" />
          Streak active in demo
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
