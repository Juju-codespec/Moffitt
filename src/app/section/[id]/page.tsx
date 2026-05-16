import { notFound } from "next/navigation";
import { SectionWorkspace } from "@/components/SectionWorkspace";
import { getSection, type SectionId } from "@/lib/sections";

const VALID: SectionId[] = ["cp", "bb", "ps", "cars"];

export function generateStaticParams() {
  return VALID.map((id) => ({ id }));
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const section = getSection(id);
  if (!section) notFound();

  return <SectionWorkspace section={section} />;
}
