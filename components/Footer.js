"use client";

import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer>
      <div className="wrap">
        <span>{t.footer}</span>
        <span className="mono">000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f</span>
      </div>
    </footer>
  );
}
