"use client";

import Link from "next/link";
import { PAGES } from "@/lib/content";
import { useLanguage } from "./LanguageProvider";

export default function ChapterCards() {
  const { lang, t } = useLanguage();
  return (
    <section className="section" id="chapters">
      <div className="wrap">
        <span className="eyebrow reveal">{t.home.chapters}</span>
        <div className="chapters">
          {PAGES.map((page) => {
            const p = t.pages[page];
            return (
              <Link key={page} href={`/${lang}/${page}`} className="chapter-card reveal">
                <span className="num">{p.num}</span>
                <h2>{p.title}</h2>
                <p>{p.summary}</p>
                <span className="includes">{p.includes}</span>
                <span className="go">
                  {t.home.read} <b aria-hidden="true">→</b>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
