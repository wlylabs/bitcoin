"use client";

import Link from "next/link";
import { PAGES } from "@/lib/content";
import { useLanguage } from "./LanguageProvider";

export default function NextChapter({ current }) {
  const { lang, t } = useLanguage();
  const next = PAGES[PAGES.indexOf(current) + 1];
  return (
    <nav className="next-chapter" aria-label={t.next.label}>
      <div className="wrap">
        <Link href={next ? `/${lang}/${next}` : `/${lang}`}>
          <span className="label">{next ? `${t.next.label} · ${t.pages[next].num}` : t.next.home}</span>
          <span className="title">
            {next ? t.pages[next].title : t.meta.title}
            <b aria-hidden="true">→</b>
          </span>
        </Link>
      </div>
    </nav>
  );
}
