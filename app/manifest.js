// Web app manifest, served at /manifest.webmanifest. Shortcut URLs carry no
// language prefix; the proxy redirects them to the reader's language.
export default function manifest() {
  return {
    id: "/",
    name: "History of Bitcoin",
    short_name: "Bitcoin",
    description:
      "The history of Bitcoin, the cryptography behind it, and how memecoins launch on DEXs. Interactive and bilingual (English / Indonesian).",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#07070a",
    theme_color: "#07070a",
    categories: ["education", "finance"],
    icons: [
      { src: "/icons/bitcoin.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "History", url: "/history", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Cryptography", url: "/cryptography", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Memecoins", url: "/memecoins", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Lab", url: "/lab", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
    screenshots: [
      { src: "/screenshots/wide.png", sizes: "1440x900", type: "image/png", form_factor: "wide", label: "Home page on desktop" },
      { src: "/screenshots/narrow.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Home page on a phone" },
    ],
  };
}
