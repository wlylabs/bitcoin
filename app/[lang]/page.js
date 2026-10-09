import Chapter from "@/components/Chapter";
import ChapterCards from "@/components/ChapterCards";
import Hero from "@/components/Hero";
import LiveBitcoin from "@/components/LiveBitcoin";
import PageShell from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell>
      <Hero />
      <LiveBitcoin />
      <Chapter />
      <ChapterCards />
    </PageShell>
  );
}
