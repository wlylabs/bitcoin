import { content, LANGS, titleFor } from "./content";

const ICONS = {
  icon: [
    { url: "/icons/bitcoin.svg", type: "image/svg+xml" },
    { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
    { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
  ],
  apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
};

// Shared by every page: title, description, canonical URL, hreflang alternates and
// Open Graph for `page` ("" is the home page) in `lang`.
export function pageMetadata(lang, page = "") {
  const title = titleFor(lang, page);
  const description = page ? content[lang].pages[page].summary : content[lang].meta.description;
  const path = (l) => `/${l}${page ? `/${page}` : ""}`;
  return {
    title,
    description,
    applicationName: content[lang].meta.title,
    icons: ICONS,
    appleWebApp: { capable: true, title: "Bitcoin", statusBarStyle: "black" },
    formatDetection: { telephone: false },
    alternates: {
      canonical: path(lang),
      languages: Object.fromEntries(LANGS.map((l) => [l, path(l)])),
    },
    openGraph: {
      title,
      description,
      type: "website",
      locale: content[lang].locale.replace("-", "_"),
      images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
    },
    twitter: { card: "summary", title, description },
  };
}
