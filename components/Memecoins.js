"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

export function Lifecycle() {
  const { t } = useLanguage();
  const l = t.memes.lifecycle;
  return (
    <section className="section section-ruled" id="dex-to-cex">
      <div className="wrap">
        <SectionHead eyebrow={l.eyebrow} title={l.title} lede={l.lede} />
        <ol className="steps">
          {l.steps.map(([title, text], i) => (
            <li key={i} className="step reveal">
              <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
              <Rich as="h3" html={title} />
              <p>{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// Bars use a log scale so a 2-day run and a 355-day run both stay readable.
const LOG_MAX = Math.log10(400);
const barWidth = (days) => `${Math.max(8, (Math.log10(days) / LOG_MAX) * 100)}%`;

export function DexToCexRace() {
  const { t } = useLanguage();
  const r = t.memes.race;
  return (
    <section className="section section-ruled" id="time-to-binance">
      <div className="wrap">
        <SectionHead eyebrow={r.eyebrow} title={r.title} lede={r.lede} />
        <div className="race reveal">
          {r.rows.map(([token, chain, from, to, days, label]) => (
            <div className="race-row" key={token}>
              <div className="race-token">
                <strong>{token}</strong>
                <span>{chain}</span>
              </div>
              <div className="race-track">
                <div className="race-bar" style={{ width: barWidth(days) }}>
                  <span>{label}</span>
                </div>
                <div className="race-dates">
                  {from} → {to}
                </div>
              </div>
            </div>
          ))}
          <div className="race-scale">{r.scale}</div>
        </div>
      </div>
    </section>
  );
}

const POOL_SOL = 50;
const POOL_MEME = 1e9;
const FEE = 0.0025;
const K = POOL_SOL * POOL_MEME;

// Constant-product swap: SOL in, MEME out, fee taken from the input.
function quote(dx) {
  const dxAfterFee = dx * (1 - FEE);
  const out = (POOL_MEME * dxAfterFee) / (POOL_SOL + dxAfterFee);
  const spot = POOL_SOL / POOL_MEME;
  const avg = dx / out;
  const sol = POOL_SOL + dx;
  const meme = POOL_MEME - out;
  return { out, spot, avg, impact: avg / spot - 1, after: sol / meme, sol, meme };
}

// Plot window for the x·y=k curve: SOL reserve on x, MEME reserve on y.
const VW = 400, VH = 220, PAD = 16;
const X_MIN = 20, X_MAX = 120, Y_MAX = 2.5e9;
const px = (sol) => PAD + ((sol - X_MIN) / (X_MAX - X_MIN)) * (VW - 2 * PAD);
const py = (meme) => VH - PAD - (meme / Y_MAX) * (VH - 2 * PAD);
const curvePath = (from, to) =>
  Array.from({ length: 61 }, (_, i) => from + ((to - from) * i) / 60)
    .map((x, i) => `${i ? "L" : "M"}${px(x).toFixed(1)} ${py(K / x).toFixed(1)}`)
    .join("");

export function AmmSimulator() {
  const { t } = useLanguage();
  const a = t.memes.amm;
  const [amount, setAmount] = useState(5);
  const q = quote(amount);
  const nf = (n, d = 2) => n.toLocaleString(t.locale, { maximumFractionDigits: d });
  const perMillion = (p) => nf(p * 1e6, 4);

  return (
    <section className="section section-ruled" id="amm">
      <div className="wrap">
        <SectionHead eyebrow={a.eyebrow} title={a.title} lede={a.lede} />
        <div className="amm reveal">
          <div className="panel">
            <div className="panel-head">
              <h3>{a.panel}</h3>
              <span>
                {a.pool}: {POOL_SOL} SOL · {nf(POOL_MEME, 0)} MEME
              </span>
            </div>
            <label className="field">
              {a.buy}
              <div className="amm-input">
                <input
                  type="range"
                  min="0.1"
                  max="50"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  aria-label={a.buy}
                />
                <output>{nf(amount, 1)} SOL</output>
              </div>
            </label>
            <dl className="stats-row amm-stats">
              <div>
                <dt>{a.receive}</dt>
                <dd>{nf(q.out / 1e6, 2)}M</dd>
              </div>
              <div>
                <dt>{a.avg}</dt>
                <dd>{perMillion(q.avg)}</dd>
              </div>
              <div>
                <dt>{a.impact}</dt>
                <dd className={q.impact > 0.1 ? "warn" : undefined}>+{nf(q.impact * 100, 1)}%</dd>
              </div>
            </dl>
            <p className="note">
              {a.after}: <b>{perMillion(q.after)}</b> SOL / 1M MEME ({nf((q.after / q.spot - 1) * 100, 1)}%↑). {a.note}
            </p>
          </div>
          <div className="panel amm-chart">
            <svg viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label="x·y = k">
              <line x1={PAD} y1={VH - PAD} x2={VW - PAD} y2={VH - PAD} stroke="rgba(255,255,255,0.2)" />
              <line x1={PAD} y1={PAD} x2={PAD} y2={VH - PAD} stroke="rgba(255,255,255,0.2)" />
              <path d={curvePath(X_MIN, X_MAX)} fill="none" stroke="rgba(237,237,240,0.35)" strokeWidth="1.5" />
              <path d={curvePath(POOL_SOL, q.sol)} fill="none" stroke="#f7931a" strokeWidth="3" />
              <line x1={px(POOL_SOL)} y1={py(POOL_MEME)} x2={px(POOL_SOL)} y2={VH - PAD} stroke="rgba(237,237,240,0.25)" strokeDasharray="3 4" />
              <line x1={px(q.sol)} y1={py(q.meme)} x2={px(q.sol)} y2={VH - PAD} stroke="rgba(247,147,26,0.45)" strokeDasharray="3 4" />
              <circle cx={px(POOL_SOL)} cy={py(POOL_MEME)} r="5" fill="#ededf0" />
              <circle cx={px(q.sol)} cy={py(q.meme)} r="6" fill="#f7931a" />
            </svg>
            <div className="amm-legend">
              <span>→ {a.reserveSol}</span>
              <span>↑ {a.reserveMeme}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SafetyChecklist() {
  const { t } = useLanguage();
  const c = t.memes.checklist;
  return (
    <section className="section section-ruled" id="checklist">
      <div className="wrap">
        <SectionHead eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
        <ul className="checklist">
          {c.items.map(([title, text]) => (
            <li key={title} className="reveal">
              <span className="check" aria-hidden="true">✓</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// How memecoins ended up on Bitcoin: Ordinals, BRC-20 and Runes, and the debate over blockspace.
export function BitcoinMemes() {
  const { t } = useLanguage();
  const b = t.memes.btc;
  return (
    <section className="section section-ruled" id="bitcoin-memes">
      <div className="wrap">
        <SectionHead eyebrow={b.eyebrow} title={b.title} lede={b.lede} />
        <div className="btcm reveal">
          {b.cards.map(([kicker, title, text]) => (
            <article key={kicker}>
              <span className="kicker">{kicker}</span>
              <h3>{title}</h3>
              <Rich as="p" html={text} />
            </article>
          ))}
        </div>
        <h3 className="btcm-debate-title reveal">{b.debate}</h3>
        <div className="btcm-debate reveal">
          {[b.pro, b.con].map(([side, text], i) => (
            <div key={side} className={i ? "con" : "pro"}>
              <b>{side}</b>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MemeOdds() {
  const { t } = useLanguage();
  const o = t.memes.odds;
  return (
    <section className="section section-ruled" id="odds">
      <div className="wrap">
        <SectionHead eyebrow={o.eyebrow} title={o.title} lede={o.lede} />
        <dl className="odds reveal">
          {o.stats.map(([big, text]) => (
            <div key={big}>
              <Rich as="dt" html={big} />
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
