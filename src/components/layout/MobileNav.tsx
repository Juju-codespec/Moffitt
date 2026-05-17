"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Brain,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/", icon: LayoutDashboard, label: "Home" },
  { href: "/notes", icon: BookOpen, label: "Notes" },
  { href: "/tutor", icon: MessageSquare, label: "Tutor" },
  { href: "/quiz", icon: Brain, label: "Quiz" },
  { href: "/analytics", icon: BarChart3, label: "Stats" },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 glass-strong lg:hidden">
      <div className="flex justify-around py-2">
        {NAV.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
              pathname === href ? "text-cyan-400" : "text-slate-500"
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
