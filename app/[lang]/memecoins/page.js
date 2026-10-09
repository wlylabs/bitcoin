import LaunchSim from "@/components/LaunchSim";
import { AmmSimulator, BitcoinMemes, DexToCexRace, Lifecycle, MemeOdds, SafetyChecklist } from "@/components/Memecoins";
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
      {/* Dogecoin, Uniswap v1, SHIB, DOGE on SNL, SHIB on Binance, Squid Game, BONK airdrop,
          BRC-20, PEPE, pump.fun, Runes, TRUMP, the PUMP sale, the first DOGE ETF. */}
      <Timeline source="memeTimeline" id="meme-timeline" headAs="h1" keyMoments={[0, 2, 4, 7, 8, 9, 10, 11, 12, 15, 19, 23, 27, 28]} />
      <BitcoinMemes />
      <Lifecycle />
      <LaunchSim />
      <MemeOdds />
      <DexToCexRace />
      <AmmSimulator />
      <SafetyChecklist />
      <Sources ids={["dogecoin", "brc20", "runes", "univ2", "uniwp", "raydium", "spltoken", "shibburn", "safemoon", "binancewif", "goat", "pumpsale", "doje"]} />
      <NextChapter current="memecoins" />
    </PageShell>
  );
}
