"use client";

import { useLanguage } from "./LanguageProvider";

export default function Chapter() {
  const { t } = useLanguage();
  return (
    <div className="chapter">
      <blockquote className="reveal">
        {t.quote.text}
        <cite>{t.quote.cite}</cite>
      </blockquote>
    </div>
  );
}
