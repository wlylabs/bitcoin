import Cryptography from "@/components/Cryptography";
import Genesis from "@/components/Genesis";
import NextChapter from "@/components/NextChapter";
import PageShell from "@/components/PageShell";
import Sources from "@/components/Sources";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return pageMetadata(lang, "cryptography");
}

export default function CryptographyPage() {
  return (
    <PageShell>
      <Cryptography />
      <Genesis />
      <Sources ids={["fips", "sec2", "secp", "bips", "devdocs", "lmab"]} />
      <NextChapter current="cryptography" />
    </PageShell>
  );
}
