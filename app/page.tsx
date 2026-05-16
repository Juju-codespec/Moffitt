import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Target, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-zinc-950 to-zinc-950" />
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-xl font-bold text-emerald-400">Pre-QBank</span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link href="/dashboard">
            <Button>
              Open App <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-16">
        <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-zinc-50 md:text-6xl">
          Master every QBank section{" "}
          <span className="text-emerald-400">before</span> you start
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-zinc-400">
          Strategic MCAT coaching that identifies the exact foundations, equations,
          traps, and reasoning patterns you need—personalized, adaptive, and
          optimized for score gains.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/dashboard">
            <Button size="lg">Start Preparing</Button>
          </Link>
          <Link href="/sections/chem-phys">
            <Button size="lg" variant="outline">
              Browse Sections
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Target,
              title: "Before You Start",
              desc: "High-yield briefings tailored to each UWorld-style topic category.",
            },
            {
              icon: Brain,
              title: "AI Tutor",
              desc: "Socratic coaching, teach-back, and AAMC-style reasoning—not flashcards.",
            },
            {
              icon: Zap,
              title: "Readiness Scoring",
              desc: "Track content, equations, passage, and timing readiness per topic.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
            >
              <f.icon className="mb-4 h-8 w-8 text-emerald-400" />
              <h3 className="font-semibold text-zinc-100">{f.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
