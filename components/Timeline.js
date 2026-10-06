"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

export default function Timeline() {
  const { t } = useLanguage();
  const tl = t.timeline;
  const box = useRef(null);
  const fill = useRef(null);

  // The orange line grows as the reader scrolls through the timeline.
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const r = box.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.6 - r.top) / r.height));
      fill.current.style.transform = `scaleY(${p})`;
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

  return (
    <section className="section" id="timeline-section">
      <div className="wrap">
        <SectionHead eyebrow={tl.eyebrow} title={tl.title} lede={tl.lede} />
        <div className="timeline" ref={box}>
          <div className="tl-fill" ref={fill} aria-hidden="true" />
          {tl.items.map(([date, tag, hot, title, text], i) => (
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
      </div>
    </section>
  );
}
