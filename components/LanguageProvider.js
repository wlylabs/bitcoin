"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { content } from "@/lib/content";

const LanguageContext = createContext(null);

export function LanguageProvider({ initialLang, children }) {
  const [lang, setLangState] = useState(initialLang);

  // Swap copy in place (no navigation, so scroll position and demo state survive),
  // then sync the URL, <html lang>, title and the cookie the proxy reads for "/".
  const setLang = useCallback((next) => {
    setLangState(next);
    document.documentElement.lang = next;
    document.title = content[next].meta.title;
    document.cookie = `lang=${next}; path=/; max-age=31536000; samesite=lax`;
    window.history.replaceState(null, "", `/${next}${window.location.hash}`);
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
