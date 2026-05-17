import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mesh-bg flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>
      </main>
      <MobileNav />
    </div>
  );
}
