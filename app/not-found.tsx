import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          404
        </p>
        <h1 className="text-3xl font-semibold text-white">Section not found</h1>
        <p className="max-w-md text-slate-400">
          Pick Chem/Phys, CARS, Bio/Biochem, or Psych/Soc from the home screen.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/15"
      >
        Back home
      </Link>
    </main>
  );
}
