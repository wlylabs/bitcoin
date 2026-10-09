"use client";

import { ERAS, eraOf, formatMonth, monthAt, MONTH_COUNT, monthIndex, MOMENTS } from "@/lib/history";
import { useLanguage } from "./LanguageProvider";

const pct = (i) => `${(i / (MONTH_COUNT - 1)) * 100}%`;
const ERA_STARTS = ERAS.map((e) => monthIndex(e.from));

// The fixed time dial at the bottom of the Time Machine: a range over every month
// from August 2008 to the last month of data, with era bands and moment ticks.
// Dragging previews any month; arrow, Home and End keys jump between moments.
export default function YearDial({ value, onPreview, onCommit, onKey, playing, onTogglePlay, visible }) {
  const { t } = useLanguage();
  const d = t.tm.dial;
  const ym = monthAt(value);
  const era = eraOf(ym);
  const text = d.value(formatMonth(ym, t.locale), t.tm.eras[era.id][0]);

  return (
    <div className={`tm-dial${visible ? " on" : ""}`} aria-hidden={!visible} inert={!visible}>
      <div className="tm-dial-inner">
        <button type="button" className="tm-play" onClick={onTogglePlay} aria-label={playing ? d.pause : d.play}>
          <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
        </button>
        <div className="tm-track">
          <div className="tm-bands" aria-hidden="true">
            {ERAS.map((e, k) => (
              <span
                key={e.id}
                className={`band-${e.id}${era.id === e.id ? " on" : ""}`}
                style={{ left: pct(ERA_STARTS[k]), right: `calc(100% - ${pct(ERA_STARTS[k + 1] ?? MONTH_COUNT - 1)})` }}
              />
            ))}
            {MOMENTS.map((m) => (
              <i key={m.id} className={m.hot ? "hot" : undefined} style={{ left: pct(monthIndex(m.ym)) }} />
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={MONTH_COUNT - 1}
            step={1}
            value={value}
            aria-label={d.label}
            aria-valuetext={text}
            onChange={(e) => onPreview(Number(e.target.value))}
            onPointerUp={(e) => onCommit(Number(e.currentTarget.value))}
            onKeyDown={(e) => {
              if (onKey(e.key)) e.preventDefault();
            }}
          />
        </div>
        <output className="tm-dial-label">{text}</output>
      </div>
    </div>
  );
}
