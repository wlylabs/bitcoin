import Halving from "@/components/Halving";
import NextChapter from "@/components/NextChapter";
import PageShell from "@/components/PageShell";
import Prologue from "@/components/Prologue";
import Sources from "@/components/Sources";
import TimeMachine, { PlayCta, TimeMachineIntro, TimeMachineNow } from "@/components/TimeMachine";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return pageMetadata(lang, "history");
}

export default function HistoryPage() {
  return (
    <PageShell>
      <TimeMachineIntro />
      <Prologue headAs="h2" />
      <TimeMachine />
      <TimeMachineNow />
      <Halving />
      <PlayCta />
      <Sources ids={["whitepaper", "nakamoto", "coinmetrics", "btcwiki", "core", "bitcoinbook", "mempool", "bolts"]} />
      <NextChapter current="history" />
    </PageShell>
  );
}
