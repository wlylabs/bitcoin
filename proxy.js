import { NextResponse } from "next/server";

const LANGS = ["en", "id"];

// Send "/" to /en or /id: a saved choice wins, then the browser's Accept-Language.
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

export function proxy(request) {
  const url = request.nextUrl.clone();
  url.pathname = `/${pickLang(request)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/"],
};
