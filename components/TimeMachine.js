"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ERAS, eraOf, monthAt, monthIndex, MOMENTS } from "@/lib/history";
import { SOURCES } from "@/lib/sources";
import EraConsole from "./EraConsole";
import EraWindow from "./EraWindow";
import { useLanguage } from "./LanguageProvider";
import LiveBitcoin from "./LiveBitcoin";
import Rich from "./Rich";
import SectionHead from "./SectionHead";
import { DEMOS } from "./TimeDemos";
import YearDial from "./YearDial";

const PLAY_EVERY = 3500;
const scrollBehavior = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

// The page's opening: title, the two ways in, and a jump list of the five eras.
export function TimeMachineIntro() {
  const { lang, t } = useLanguage();
  const tm = t.tm;
  return (
    <section className="tm-intro" aria-labelledby="tm-title">
      <div className="wrap intro">
        <span className="eyebrow">{tm.eyebrow}</span>
        <Rich as="h1" id="tm-title" html={tm.title} />
        <p className="lede">{tm.lede}</p>
        <div className="cta-row">
          <a className="btn" href="#era-genesis">{tm.start} <b aria-hidden="true">↓</b></a>
          <Link className="btn ghost" href={`/${lang}/play`}>{tm.play}</Link>
        </div>
        <ol className="era-strip">
          {ERAS.map((e, i) => {
            const [name, years] = tm.eras[e.id];
            return (
              <li key={e.id} className={`era-chip era-${e.id}`}>
                <a href={`#era-${e.id}`}>
                  <span className="n">0{i + 1}</span>
                  <b>{name}</b>
                  <small>{years}</small>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

// Where the machine stops: the live Bitcoin v0.1 window, framed as "now".
export function TimeMachineNow() {
  const { t } = useLanguage();
  return <LiveBitcoin head={t.tm.now} note={t.tm.now.last} />;
}

// Hand-off to Satoshi's Wallet at the end of the page.
export function PlayCta() {
  const { lang, t } = useLanguage();
  const c = t.tm.cta;
  return (
    <section className="section section-ruled play-cta">
      <div className="wrap">
        <SectionHead eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
        <Link className="btn reveal" href={`/${lang}/play`}>
          {c.button} <b aria-hidden="true">→</b>
        </Link>
      </div>
    </section>
  );
}

export default function TimeMachine() {
  const { t } = useLanguage();
  const tm = t.tm;
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(null); // month index while the dial is dragged
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const box = useRef(null);
  const items = useRef([]);
  const activeRef = useRef(0);
  const target = useRef(null); // moment a key press is scrolling to, so rapid presses keep counting
  const targetTimer = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);
  useEffect(() => () => clearTimeout(targetTimer.current), []);

  const goTo = useCallback((i, behavior = scrollBehavior()) => {
    items.current[i]?.scrollIntoView({ block: "start", behavior });
  }, []);

  // The active moment is the one crossing a band just above the middle of the viewport.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number(e.target.dataset.i))),
      { rootMargin: "-42% 0px -52% 0px" }
    );
    items.current.forEach((el) => el && io.observe(el));
    const seen = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "-30% 0px -40% 0px" });
    seen.observe(box.current);
    return () => {
      io.disconnect();
      seen.disconnect();
    };
  }, []);

  // ?y=2014 opens the machine at that year (links from Satoshi's Wallet use this).
  useEffect(() => {
    const y = new URLSearchParams(window.location.search).get("y");
    if (!y) return;
    const i = MOMENTS.findIndex((m) => m.ym >= y);
    if (i >= 0) requestAnimationFrame(() => goTo(i, "auto"));
  }, [goTo]);

  // Keep the URL on the current year so the spot can be shared.
  useEffect(() => {
    if (!visible) return;
    const url = `${window.location.pathname}?y=${MOMENTS[active].ym.slice(0, 4)}`;
    window.history.replaceState(window.history.state, "", url);
  }, [active, visible]);

  // Autoplay steps through the moments; any manual scroll or key press hands control back.
  useEffect(() => {
    if (!playing) return;
    const stop = () => setPlaying(false);
    const id = setInterval(() => {
      const next = activeRef.current + 1;
      if (next >= MOMENTS.length) return stop();
      goTo(next);
    }, PLAY_EVERY);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("touchstart", stop, { passive: true });
    window.addEventListener("keydown", stop);
    return () => {
      clearInterval(id);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("touchstart", stop);
      window.removeEventListener("keydown", stop);
    };
  }, [playing, goTo]);

  const commit = (month) => {
    setPreview(null);
    const target = monthAt(month);
    let i = MOMENTS.findIndex((m) => m.ym >= target);
    if (i < 0) i = MOMENTS.length - 1;
    goTo(i);
  };

  const KEY_STEPS = { ArrowRight: 1, ArrowUp: 1, PageUp: 1, ArrowLeft: -1, ArrowDown: -1, PageDown: -1 };
  const onKey = (key) => {
    const last = MOMENTS.length - 1;
    const from = target.current ?? activeRef.current;
    let i;
    if (key === "Home") i = 0;
    else if (key === "End") i = last;
    else if (KEY_STEPS[key]) i = Math.min(last, Math.max(0, from + KEY_STEPS[key]));
    else return false;
    target.current = i;
    clearTimeout(targetTimer.current);
    targetTimer.current = setTimeout(() => (target.current = null), 1200);
    goTo(i);
    return true;
  };

  const togglePlay = () => {
    if (!playing && activeRef.current >= MOMENTS.length - 1) goTo(0, "auto");
    else if (!playing) goTo(activeRef.current);
    setPlaying((p) => !p);
  };

  const ym = preview === null ? MOMENTS[active].ym : monthAt(preview);
  let prevEra = null;

  return (
    <section className="tm" ref={box} data-era={eraOf(ym).id} aria-label={tm.dial.label}>
      <div className="wrap tm-grid">
        <div className="tm-steps">
          {MOMENTS.map((m, i) => {
            const era = eraOf(m.ym);
            const [date, tag, title, text] = tm.moments[m.id];
            const Demo = m.play && DEMOS[m.play];
            const demo = m.play && tm.demos[m.play];
            const divider = era.id !== prevEra;
            prevEra = era.id;
            const [eraName, eraYears, eraBlurb] = tm.eras[era.id];
            return (
              <div key={m.id} className="tm-step">
                {divider && (
                  <header className={`tm-era-head era-${era.id}`} id={`era-${era.id}`}>
                    <span className="eyebrow">{eraYears}</span>
                    <h2>{eraName}</h2>
                    <p>{eraBlurb}</p>
                  </header>
                )}
                <article
                  className={`tm-moment${m.hot ? " hot" : ""}${i === active ? " active" : ""}`}
                  data-i={i}
                  ref={(el) => {
                    items.current[i] = el;
                  }}
                >
                  <div className="tm-date">
                    <button type="button" className="tm-date-btn" onClick={() => goTo(i)}>{date}</button>
                    {tag && <span className={m.hot ? "tag hot" : "tag"}>{tag}</span>}
                  </div>
                  <Rich as="h3" html={title} />
                  <Rich as="p" html={text} />
                  {Demo && (
                    <EraWindow skin={era.skin} title={`${tm.tryIt} · ${demo.title}`} nav={tm.console.forumNav} className="tm-demo">
                      <Demo d={demo} t={t} />
                    </EraWindow>
                  )}
                  {m.src && (
                    <a className="tm-src" href={SOURCES[m.src][1]} target="_blank" rel="noopener noreferrer">
                      {tm.source} · {SOURCES[m.src][0]} <b aria-hidden="true">↗</b>
                    </a>
                  )}
                </article>
              </div>
            );
          })}
        </div>
        <aside className="tm-side">
          <div className="tm-sticky">
            <EraConsole ym={ym} />
          </div>
        </aside>
      </div>
      <YearDial
        value={preview ?? monthIndex(ym)}
        onPreview={setPreview}
        onCommit={commit}
        onKey={onKey}
        playing={playing}
        onTogglePlay={togglePlay}
        visible={visible}
      />
    </section>
  );
}
