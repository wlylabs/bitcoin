"use client";

import { SOURCES } from "@/lib/sources";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";

export default function Sources({ ids }) {
  const { t } = useLanguage();
  return (
    <section className="sources section-ruled" aria-labelledby="sources-heading">
      <div className="wrap">
        <h2 id="sources-heading">{t.sources.heading}</h2>
        <ul className="ref-list">
          {ids.map((id) => {
            const [name, href] = SOURCES[id];
            return (
              <li key={id}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  <strong>{name}</strong>
                  <b className="arrow">↗</b>
                  <Rich html={t.sources.desc[id]} />
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
