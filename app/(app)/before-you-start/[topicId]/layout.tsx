import { Suspense } from "react";

export default function BeforeYouStartLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-8 text-zinc-400">Loading...</div>}>
      {children}
    </Suspense>
  );
}
