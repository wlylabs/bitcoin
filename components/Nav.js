"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";

// [route code, toggle label, full name for screen readers]
const LANG_OPTIONS = [
  ["en", "EN", "English"],
  ["id", "WKWK", "Bahasa Indonesia"],
];

export default function Nav() {
  const { lang, setLang, t } = useLanguage();
  const pathname = usePathname();
  const current = pathname.split("/")[2] ?? "";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a className="skip" href="#main">{t.skip}</a>
      <div className="progress" ref={progress} aria-hidden="true" />
      <header className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="wrap">
          <Link className="brand" href={`/${lang}`} aria-label={t.nav.home}>
            <span className="brand-mark" aria-hidden="true">₿</span>
            <span className="brand-text">{t.nav.brand}</span>
          </Link>
          <div className="nav-right">
            <ul className={`nav-links${open ? " open" : ""}`} id="navLinks">
              {t.nav.links.map(([page, label]) => (
                <li key={page}>
                  <Link
                    href={`/${lang}/${page}`}
                    className={current === page ? "active" : undefined}
                    aria-current={current === page ? "page" : undefined}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="lang" role="group" aria-label={t.nav.langLabel}>
              {LANG_OPTIONS.map(([code, label, name]) => (
                <button
                  key={code}
                  type="button"
                  lang={code}
                  aria-label={`${label} (${name})`}
                  aria-pressed={lang === code}
                  onClick={() => setLang(code)}
                >
                  {label}
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
