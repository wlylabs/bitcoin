"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";

export default function Nav() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(null);
  const progress = useRef(null);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      setScrolled(y > 24);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const spy = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
    return () => spy.disconnect();
  }, []);

  return (
    <>
      <div className="progress" ref={progress} aria-hidden="true" />
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="wrap">
          <a className="brand" href="#top" aria-label={t.nav.home}>
            <span className="brand-mark" aria-hidden="true">₿</span>
            <span className="brand-text">{t.nav.brand}</span>
          </a>
          <div className="nav-right">
            <ul className={`nav-links${open ? " open" : ""}`} id="navLinks">
              {t.nav.links.map(([id, label]) => (
                <li key={id}>
                  <a href={`#${id}`} className={active === id ? "active" : undefined} onClick={() => setOpen(false)}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="lang" role="group" aria-label={t.nav.langLabel}>
              {["en", "id"].map((code) => (
                <button key={code} type="button" lang={code} aria-pressed={lang === code} onClick={() => setLang(code)}>
                  {code.toUpperCase()}
                </button>
              ))}
            </div>
            <button
              className="menu-btn"
              type="button"
              aria-expanded={open}
              aria-controls="navLinks"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? t.nav.close : t.nav.menu}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
