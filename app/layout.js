import { Instrument_Serif, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import "./globals.css";

const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
const sans = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

export const metadata = {
  title: "History of Bitcoin",
  description:
    "The history of Bitcoin from the cypherpunk era to the fourth halving, plus the cryptography behind it: SHA-256, secp256k1, Schnorr, Merkle trees and proof-of-work. Try it live in your browser.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23f7931a'/%3E%3Ctext x='32' y='44' font-family='Arial' font-weight='700' font-size='36' text-anchor='middle' fill='%2307070a'%3E%E2%82%BF%3C/text%3E%3C/svg%3E",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07070a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
