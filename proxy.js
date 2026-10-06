import { NextResponse } from "next/server";

const LANGS = ["en", "id"];

// Pick a language for a URL without one: a saved choice wins, then the browser's Accept-Language.
function pickLang(request) {
  const saved = request.cookies.get("lang")?.value;
  if (LANGS.includes(saved)) return saved;
  const accept = request.headers.get("accept-language") ?? "";
  for (const part of accept.split(",")) {
    const code = part.split(";")[0].trim().toLowerCase().slice(0, 2);
    if (LANGS.includes(code)) return code;
  }
  return "en";
}

// "/" and the language-less chapter paths (used by the PWA shortcuts) redirect to /{lang}/...
export function proxy(request) {
  const url = request.nextUrl.clone();
  url.pathname = `/${pickLang(request)}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/", "/history", "/cryptography", "/memecoins", "/lab"],
};
