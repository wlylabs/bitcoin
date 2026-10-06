import { AmmSimulator, DexToCexRace, Lifecycle, SafetyChecklist } from "@/components/Memecoins";
import NextChapter from "@/components/NextChapter";
import PageShell from "@/components/PageShell";
import Sources from "@/components/Sources";
import Timeline from "@/components/Timeline";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return pageMetadata(lang, "memecoins");
}

export default function MemecoinsPage() {
  return (
    <PageShell>
      {/* Dogecoin, Uniswap v1, SHIB, DOGE on SNL, SHIB on Binance, Squid Game,
          BONK airdrop, PEPE, pump.fun, TRUMP. */}
      <Timeline source="memeTimeline" id="meme-timeline" headAs="h1" keyMoments={[0, 2, 4, 7, 8, 9, 10, 11, 13, 17]} />
      <Lifecycle />
      <DexToCexRace />
      <AmmSimulator />
      <SafetyChecklist />
      <Sources ids={["dogecoin", "univ2", "uniwp", "raydium", "spltoken", "shibburn", "safemoon", "binancewif"]} />
      <NextChapter current="memecoins" />
    </PageShell>
  );
}
