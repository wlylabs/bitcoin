import { notFound } from "next/navigation";
import { Instrument_Serif, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import { content, LANGS } from "@/lib/content";
import "../globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const sans = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23f7931a'/%3E%3Ctext x='32' y='44' font-family='Arial' font-weight='700' font-size='36' text-anchor='middle' fill='%2307070a'%3E%E2%82%BF%3C/text%3E%3C/svg%3E";

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { meta } = content[lang];
  return {
    title: meta.title,
    description: meta.description,
    icons: { icon: ICON },
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(LANGS.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "website",
      locale: content[lang].locale.replace("-", "_"),
    },
    twitter: { card: "summary", title: meta.title, description: meta.description },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07070a",
};

export default async function RootLayout({ children, params }) {
  const { lang } = await params;
  if (!LANGS.includes(lang)) notFound();
  return (
    // The inline script adds `js` before paint so scroll-reveal content stays visible without JavaScript.
    <html lang={lang} className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <LanguageProvider initialLang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
