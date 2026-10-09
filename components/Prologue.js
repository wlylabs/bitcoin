"use client";

import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

export default function Prologue({ headAs = "h1" }) {
  const { t } = useLanguage();
  const p = t.prolog;
  return (
    <section className="section" id="prolog">
      <div className="wrap">
        <SectionHead as={headAs} eyebrow={p.eyebrow} title={p.title} lede={p.lede} />
        <div className="prolog reveal">
          {p.items.map(([year, title, text, who]) => (
            <article key={year}>
              <div className="year">{year}</div>
              <Rich as="h3" html={title} />
              <p>{text}</p>
              <div className="who">{who}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
