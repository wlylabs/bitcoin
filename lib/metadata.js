import { content, LANGS, titleFor } from "./content";

const ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23f7931a'/%3E%3Ctext x='32' y='44' font-family='Arial' font-weight='700' font-size='36' text-anchor='middle' fill='%2307070a'%3E%E2%82%BF%3C/text%3E%3C/svg%3E";

// Shared by every page: title, description, canonical URL, hreflang alternates and
// Open Graph for `page` ("" is the home page) in `lang`.
export function pageMetadata(lang, page = "") {
  const title = titleFor(lang, page);
  const description = page ? content[lang].pages[page].summary : content[lang].meta.description;
  const path = (l) => `/${l}${page ? `/${page}` : ""}`;
  return {
    title,
    description,
    icons: { icon: ICON },
    alternates: {
      canonical: path(lang),
      languages: Object.fromEntries(LANGS.map((l) => [l, path(l)])),
    },
    openGraph: { title, description, type: "website", locale: content[lang].locale.replace("-", "_") },
    twitter: { card: "summary", title, description },
  };
}
