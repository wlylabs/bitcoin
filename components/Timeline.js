"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/lib/useReveal";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

// Indexes into timeline.items shown by default: whitepaper, genesis, first transaction,
// Pizza Day, first halving, Mt. Gox, SegWit, Taproot, spot ETFs, last satoshi.
const KEY_MOMENTS = new Set([1, 2, 4, 6, 9, 10, 12, 16, 17, 19]);

export default function Timeline() {
  const { t } = useLanguage();
  const tl = t.timeline;
  const box = useRef(null);
  const fill = useRef(null);
  const [all, setAll] = useState(false);
  useReveal([all]);

  // The orange line grows as the reader scrolls through the timeline.
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      // A frame queued just before navigating away can run after unmount.
      if (!box.current) return;
      const r = box.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      fill.current.style.transform = `scaleY(${p})`;
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
  }, [all]);

  const items = tl.items.map((item, i) => [item, i]).filter(([, i]) => all || KEY_MOMENTS.has(i));

  return (
    <section className="section" id="timeline-section">
      <div className="wrap">
        <SectionHead eyebrow={tl.eyebrow} title={tl.title} lede={tl.lede} />
        <div className="timeline" ref={box}>
          <div className="tl-fill" ref={fill} aria-hidden="true" />
          {items.map(([[date, tag, hot, title, text], i]) => (
            <div className="tl-item reveal" key={i}>
              <span className="tl-dot" />
              <div className="tl-date">
                {date}
                {tag && <span className={hot ? "tag hot" : "tag"}>{tag}</span>}
              </div>
              <Rich as="h3" html={title} />
              <Rich as="p" html={text} />
            </div>
          ))}
        </div>
        <div className="tl-more">
          <button className="btn ghost" type="button" aria-expanded={all} onClick={() => setAll((v) => !v)}>
            {all ? tl.showKey : tl.showAll(tl.items.length)}
          </button>
        </div>
      </div>
    </section>
  );
}
