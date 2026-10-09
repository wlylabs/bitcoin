"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";

const GENESIS = Date.UTC(2009, 0, 3, 18, 15, 5);

function useSinceGenesis() {
  const [secs, setSecs] = useState(null);
  useEffect(() => {
    const tick = () => setSecs(Math.floor((Date.now() - GENESIS) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return secs;
}

export default function Hero() {
  const { lang, t } = useLanguage();
  const s = useSinceGenesis();

  let days = "—";
  let clock = null;
  if (s !== null) {
    const pad = (n) => String(n).padStart(2, "0");
    days = `${Math.floor(s / 86400).toLocaleString(t.locale)} ${t.hero.days}`;
    clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  return (
    <section className="hero" aria-label={t.hero.aria}>
      <div className="wrap hero-inner intro">
        <div className="headline-quote" title={t.hero.quoteTitle}>
          <b>{t.hero.block}</b>
          <span>&quot;The Times 03/Jan/2009 Chancellor on brink of second bailout for banks&quot;</span>
        </div>
        <Rich as="h1" html={t.hero.title} />
        <p className="lede">{t.hero.lede}</p>
        <div className="cta-row hero-cta">
          <Link className="btn" href={`/${lang}/history`}>
            {t.hero.ctaTime} <b aria-hidden="true">→</b>
          </Link>
          <Link className="btn ghost" href={`/${lang}/play`}>
            {t.hero.ctaPlay}
          </Link>
        </div>
        <dl className="hero-stats">
          <div>
            <dt>{t.hero.since}</dt>
            <dd>
              {days}
              {clock && <span className="tick">{clock}</span>}
            </dd>
          </div>
          <div>
            <dt>{t.hero.supply}</dt>
            <dd>{(21000000).toLocaleString(t.locale)}</dd>
          </div>
          <div>
            <dt>{t.hero.hash}</dt>
            <dd>SHA-256²</dd>
          </div>
        </dl>
      </div>
      <a className="scroll-cue" href="#live" aria-label={t.hero.scrollAria}>
        {t.hero.scroll}
        <i />
      </a>
    </section>
  );
}
