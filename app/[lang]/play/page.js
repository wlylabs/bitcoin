import NextChapter from "@/components/NextChapter";
import PageShell from "@/components/PageShell";
import SatoshiWallet from "@/components/SatoshiWallet";
import Sources from "@/components/Sources";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return pageMetadata(lang, "play");
}

export default function PlayPage() {
  return (
    <PageShell>
      <SatoshiWallet />
      <Sources ids={["coinmetrics", "mtgox", "pizza", "ftx", "btcwiki"]} />
      <NextChapter current="play" />
    </PageShell>
  );
}
