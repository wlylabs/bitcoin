"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { content, PAGES, titleFor } from "@/lib/content";

const LanguageContext = createContext(null);

export function LanguageProvider({ initialLang, children }) {
  const [lang, setLangState] = useState(initialLang);

  // Back/forward can land on the other language's URL without remounting the layout.
  useEffect(() => setLangState(initialLang), [initialLang]);

  // Swap copy in place (no navigation, so scroll position and demo state survive),
  // then sync the URL, <html lang>, title and the cookie the proxy reads for "/".
  const setLang = useCallback((next) => {
    const [, , page = ""] = window.location.pathname.split("/");
    setLangState(next);
    document.documentElement.lang = next;
    document.title = titleFor(next, PAGES.includes(page) ? page : "");
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    window.history.replaceState(null, "", `/${next}${page ? `/${page}` : ""}${window.location.hash}`);
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: content[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
