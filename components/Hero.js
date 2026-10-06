"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";

const GENESIS = Date.UTC(2009, 0, 3, 18, 15, 5);
const HEX = "0123456789abcdef";

function useHashRain(ref) {
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w, h, cols, drops, size;
    let running = true;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      size = w < 600 ? 13 : 15;
      cols = Math.ceil(w / (size * 1.3));
      drops = Array.from({ length: cols }, () => ({
        y: Math.random() * -h,
        v: 0.4 + Math.random() * 1.1,
        hot: Math.random() < 0.06,
      }));
      ctx.fillStyle = "#07070a";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${size}px ${getComputedStyle(document.body).getPropertyValue("--mono")}`;
      if (reduce) {
        for (let i = 0; i < cols; i++)
          for (let y = 0; y < h; y += size * 1.6) {
            ctx.fillStyle = Math.random() < 0.02 ? "rgba(247,147,26,0.6)" : "rgba(237,237,240,0.06)";
            ctx.fillText(HEX[(Math.random() * 16) | 0], i * size * 1.3, y);
          }
      }
    };

    const frame = () => {
      if (!running) return;
      ctx.fillStyle = "rgba(7,7,10,0.09)";
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) {
        const d = drops[i];
        ctx.fillStyle = d.hot ? "rgba(247,147,26,0.85)" : "rgba(237,237,240,0.16)";
        ctx.fillText(HEX[(Math.random() * 16) | 0], i * size * 1.3, d.y);
        d.y += size * d.v * 0.5;
        if (d.y > h + 40) {
          d.y = Math.random() * -200;
          d.v = 0.4 + Math.random() * 1.1;
          d.hot = Math.random() < 0.06;
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      if (cv.clientWidth !== w) resize();
    };
    resize();
    window.addEventListener("resize", onResize);
    if (reduce) return () => window.removeEventListener("resize", onResize);

    // Pause the animation while the hero is off screen.
    const io = new IntersectionObserver(([e]) => {
      const was = running;
      running = e.isIntersecting;
      if (running && !was) raf = requestAnimationFrame(frame);
    });
    io.observe(cv);
    raf = requestAnimationFrame(frame);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [ref]);
}

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
  const { t } = useLanguage();
  const canvas = useRef(null);
  useHashRain(canvas);
  const s = useSinceGenesis();

  let since = "—";
  if (s !== null) {
    const pad = (n) => String(n).padStart(2, "0");
    const days = Math.floor(s / 86400).toLocaleString(t.locale);
    since = `${days}${t.hero.daySuffix} ${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }

  return (
    <section className="hero" aria-label={t.hero.aria}>
      <canvas id="rain" ref={canvas} aria-hidden="true" />
      <div className="wrap hero-inner intro">
        <div className="headline-quote" title={t.hero.quoteTitle}>
          <b>{t.hero.block}</b>
          <span>&quot;The Times 03/Jan/2009 Chancellor on brink of second bailout for banks&quot;</span>
        </div>
        <Rich as="h1" html={t.hero.title} />
        <p className="lede">{t.hero.lede}</p>
        <dl className="hero-stats">
          <div>
            <dt>{t.hero.since}</dt>
            <dd>{since}</dd>
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
      <a className="scroll-cue" href="#prolog" aria-label={t.hero.scrollAria}>
        {t.hero.scroll}
        <i />
      </a>
    </section>
  );
}
