"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

const YEARS = [2009, 2012, 2016, 2020, 2024, 2028, 2032, 2036];
// supplyStart: BTC in existence when the epoch begins (0 at genesis).
const EPOCHS = (() => {
  let supply = 0;
  return YEARS.map((year, i) => {
    const reward = 50 / 2 ** i;
    const epoch = { year, reward, supplyStart: supply / 1e6, block: i * 210000, future: i >= 5 };
    supply += reward * 210000;
    return epoch;
  });
})();

// The SVG is drawn at the container's real pixel width, so text stays at its
// CSS size on phones instead of being scaled down with the whole chart.
const H = 300, PL = 40, PR = 48, PT = 16, PB = 36;
const IH = H - PT - PB;
const yR = (r) => PT + IH - (r / 50) * IH;
const yS = (s) => PT + IH - (s / 21) * IH;

function useWidth(ref, fallback) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

export default function Halving() {
  const { t } = useLanguage();
  const h = t.halving;
  const [hover, setHover] = useState(null);
  const box = useRef(null);
  const W = Math.max(240, useWidth(box, 760));
  const IW = W - PL - PR;
  const BW = IW / EPOCHS.length;
  const cx = (k) => PL + BW * k + BW / 2;
  const short = BW < 40; // "'09" instead of "2009" when columns get narrow
  const nf = (n, d = 3) => n.toLocaleString(t.locale, { maximumFractionDigits: d });
  const line = EPOCHS.map((e, k) => `${k ? "L" : "M"}${cx(k).toFixed(1)} ${yS(e.supplyStart).toFixed(1)}`).join("");

  return (
    <section className="section section-ruled" id="halving">
      <div className="wrap">
        <SectionHead eyebrow={h.eyebrow} title={h.title} lede={h.lede} />
        <div className="chart-card reveal">
          <div className="chart-legend">
            <span style={{ "--c": "var(--accent)" }}><i />{h.reward}</span>
            <span style={{ "--c": "#ededf0" }}><i />{h.supply}</span>
          </div>
          <div id="halvingChart" ref={box}>
            <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={h.chartAria}>
              <g stroke="rgba(255,255,255,0.07)">
                {[0, 0.25, 0.5, 0.75, 1].map((f) => (
                  <line key={f} x1={PL} x2={W - PR} y1={PT + IH * (1 - f)} y2={PT + IH * (1 - f)} />
                ))}
              </g>
              <g fontSize="11" fill="#5d5d6b" fontFamily="var(--mono)">
                {[0, 12.5, 25, 37.5, 50].map((v) => (
                  <text key={`r${v}`} x={PL - 8} y={yR(v) + 3} textAnchor="end">{v}</text>
                ))}
                {[0, 5.25, 10.5, 15.75, 21].map((v) => (
                  <text key={`s${v}`} x={W - PR + 8} y={yS(v) + 3}>{v}M</text>
                ))}
              </g>
              {EPOCHS.map((e, k) => {
                const y = yR(e.reward);
                const dim = hover !== null && hover !== k;
                return (
                  <g
                    key={e.year}
                    tabIndex={0}
                    style={{ cursor: "pointer", outline: "none" }}
                    onPointerEnter={() => setHover(k)}
                    onPointerLeave={(ev) => ev.pointerType !== "touch" && setHover(null)}
                    onFocus={() => setHover(k)}
                    onBlur={() => setHover(null)}
                    onClick={() => setHover(k)}
                  >
                    <rect x={PL + BW * k} y={PT} width={BW} height={IH} fill="transparent" />
                    <rect
                      x={PL + BW * k + BW * 0.18}
                      y={y}
                      width={BW * 0.64}
                      height={Math.max(1, PT + IH - y)}
                      rx="3"
                      fill={e.future ? "rgba(247,147,26,0.22)" : "#f7931a"}
                      stroke={e.future ? "rgba(247,147,26,0.6)" : "none"}
                      strokeDasharray={e.future ? "3 3" : undefined}
                      opacity={dim ? 0.35 : 1}
                      style={{ transition: "opacity 0.2s" }}
                    />
                    <text x={cx(k)} y={H - 14} textAnchor="middle" fontSize="11" fontFamily="var(--mono)" fill={e.future ? "#5d5d6b" : "#9a9aa8"}>
                      {short ? `'${String(e.year).slice(2)}` : e.year}
                    </text>
                  </g>
                );
              })}
              <path d={line} fill="none" stroke="#ededf0" strokeWidth="1.5" />
              {EPOCHS.map((e, k) => (
                <circle key={e.year} cx={cx(k)} cy={yS(e.supplyStart)} r="3.5" fill="#07070a" stroke="#ededf0" strokeWidth="1.5" />
              ))}
            </svg>
          </div>
          {hover === null ? (
            <div className="chart-tip">{h.hint}</div>
          ) : (
            <Rich as="div" className="chart-tip" html={h.tip(EPOCHS[hover], nf)} />
          )}
        </div>
        <dl className="epochs reveal">
          {EPOCHS.slice(0, 6).map((e) => (
            <div key={e.year}>
              <dt>{e.year}{e.future ? ` · ${h.estimated}` : ""}</dt>
              <dd>{nf(e.reward, 5)} BTC</dd>
              <small>{h.block} {nf(e.block)}</small>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
