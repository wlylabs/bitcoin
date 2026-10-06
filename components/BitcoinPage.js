"use client";

import { useEffect } from "react";
import Chapter from "./Chapter";
import Cryptography from "./Cryptography";
import Genesis from "./Genesis";
import Halving from "./Halving";
import Hero from "./Hero";
import Lab from "./Lab";
import { useLanguage } from "./LanguageProvider";
import Nav from "./Nav";
import Prologue from "./Prologue";
import References from "./References";
import Timeline from "./Timeline";

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

export default function BitcoinPage() {
  const { t } = useLanguage();
  useReveal();
  return (
    <>
      <Nav />
      <main id="top" tabIndex={-1}>
        <Hero />
        <Prologue />
        <Chapter />
        <Timeline />
        <Cryptography />
        <Lab />
        <Genesis />
        <Halving />
        <References />
      </main>
      <footer>
        <div className="wrap">
          <span>{t.footer}</span>
          <span className="mono">000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f</span>
        </div>
      </footer>
    </>
  );
}
