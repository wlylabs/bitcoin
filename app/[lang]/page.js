import Chapter from "@/components/Chapter";
import ChapterCards from "@/components/ChapterCards";
import Hero from "@/components/Hero";
import PageShell from "@/components/PageShell";

export default function HomePage() {
  return (
    <PageShell>
      <Hero />
      <Chapter />
      <ChapterCards />
    </PageShell>
  );
}
