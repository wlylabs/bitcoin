import Halving from "@/components/Halving";
import NextChapter from "@/components/NextChapter";
import PageShell from "@/components/PageShell";
import Prologue from "@/components/Prologue";
import Sources from "@/components/Sources";
import Timeline from "@/components/Timeline";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return pageMetadata(lang, "history");
}

export default function HistoryPage() {
  return (
    <PageShell>
      <Prologue />
      {/* Whitepaper, genesis, first transaction, Pizza Day, first halving, Mt. Gox,
          SegWit, Taproot, spot ETFs, last satoshi. */}
      <Timeline keyMoments={[1, 2, 4, 6, 9, 10, 12, 16, 17, 19]} />
      <Halving />
      <Sources ids={["whitepaper", "nakamoto", "core", "bitcoinbook", "bolts"]} />
      <NextChapter current="history" />
    </PageShell>
  );
}
