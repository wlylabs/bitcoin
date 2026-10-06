import Lab from "@/components/Lab";
import NextChapter from "@/components/NextChapter";
import PageShell from "@/components/PageShell";
import Sources from "@/components/Sources";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return pageMetadata(lang, "lab");
}

export default function LabPage() {
  return (
    <PageShell>
      <Lab />
      <Sources ids={["fips", "bitcoinbook", "mempool"]} />
      <NextChapter current="lab" />
    </PageShell>
  );
}
