"use client";

import { useEffect, useReducer } from "react";
import { useLanguage } from "./LanguageProvider";
import SectionHead from "./SectionHead";

// pump.fun-style bonding curve: a constant-product curve over virtual reserves of
// 30 SOL and 1.073 billion tokens. It "graduates" once 793.1 million tokens are
// sold (about 85 real SOL), and liquidity then moves to a DEX pool at the same price.
const V_SOL = 30;
const V_TOK = 1_073_000_000;
const GRAD_TOK = V_TOK - 793_100_000;
const FEE = 0.01;
const SUPPLY = 1e9;
const SOL_USD = 150;
const TICK_MS = 450;

// The launch script: what everyone except you does at each tick. Amounts are SOL
// for buys and a share of current holdings for sells. Fictional, but in the usual order.
const SCRIPT = {
  0: [["buy", "dev", 8, "dev"]],
  1: [["buy", "snipers", 12, "snipers"]],
  2: [["buy", "crowd", 1.5]], 3: [["buy", "crowd", 2]], 4: [["buy", "crowd", 1]],
  5: [["buy", "crowd", 2.5]], 6: [["buy", "crowd", 3]], 7: [["buy", "crowd", 2]],
  8: [["buy", "crowd", 4, "trending"]],
  9: [["buy", "crowd", 5]], 10: [["buy", "crowd", 6]], 11: [["buy", "crowd", 4]],
  12: [["buy", "crowd", 7]], 13: [["buy", "crowd", 5]],
  14: [["buy", "crowd", 8, "kol"]],
  15: [["buy", "crowd", 9]], 16: [["buy", "crowd", 7]], 17: [["buy", "crowd", 10]], 18: [["buy", "crowd", 6]],
  19: [["buy", "crowd", 5]], 20: [["buy", "crowd", 3]], 21: [["buy", "crowd", 4]],
  22: [["sell", "snipers", 0.5, "snipersSell"]], 23: [["sell", "snipers", 1]],
  24: [["buy", "crowd", 2]],
  26: [["sell", "dev", 1, "devSell"]],
  27: [["sell", "crowd", 0.15, "panic"]], 28: [["sell", "crowd", 0.15]], 29: [["sell", "crowd", 0.15]],
  30: [["sell", "crowd", 0.1]], 31: [["sell", "crowd", 0.1]], 32: [["buy", "crowd", 0.5]],
  33: [["sell", "crowd", 0.05]], 35: [["sell", "crowd", 0.05]], 36: [["buy", "crowd", 0.5]],
  38: [["sell", "crowd", 0.05]], 40: [["sell", "crowd", 0.05]],
  42: [["sell", "crowd", 0.03, "end"]],
};
const LAST = 42;
const ACTORS = ["dev", "snipers", "you", "crowd"];

const priceOf = (s) => s.sol / s.tok;

function buy(s, who, sol) {
  const solIn = sol * (1 - FEE);
  const out = s.tok - (s.sol * s.tok) / (s.sol + solIn);
  const a = s.book[who];
  return { ...s, sol: s.sol + solIn, tok: s.tok - out, book: { ...s.book, [who]: { ...a, spent: a.spent + sol, tokens: a.tokens + out } }, last: out };
}
function sell(s, who, part) {
  const a = s.book[who];
  const amount = a.tokens * part;
  if (amount <= 0) return { ...s, last: 0 };
  const solOut = s.sol - (s.sol * s.tok) / (s.tok + amount);
  const got = solOut * (1 - FEE);
  return { ...s, sol: s.sol - solOut, tok: s.tok + amount, book: { ...s.book, [who]: { ...a, got: a.got + got, tokens: a.tokens - amount } }, last: got, lastTok: amount };
}
// Graduation: the real SOL moves to a pool priced exactly where the curve ended.
function graduate(s) {
  if (s.graduated || s.tok > GRAD_TOK) return s;
  const price = priceOf(s);
  const sol = s.sol - V_SOL;
  return { ...s, sol, tok: sol / price, graduated: s.t, log: [...s.log, { key: "graduated", t: s.t }] };
}

function initial() {
  const book = Object.fromEntries(ACTORS.map((a) => [a, { spent: 0, got: 0, tokens: 0 }]));
  return { t: -1, sol: V_SOL, tok: V_TOK, book, graduated: null, running: false, history: [V_SOL / V_TOK], marks: [], log: [], size: 1 };
}

function reducer(s, action) {
  switch (action.type) {
    case "toggle":
      return s.t >= LAST ? s : { ...s, running: !s.running };
    case "reset":
      return { ...initial(), size: s.size };
    case "size":
      return { ...s, size: action.size };
    case "tick": {
      if (s.t >= LAST) return { ...s, running: false };
      let n = { ...s, t: s.t + 1 };
      for (const [kind, who, amt, event] of SCRIPT[n.t] ?? []) {
        n = kind === "buy" ? buy(n, who, amt) : sell(n, who, amt);
        if (event) n = { ...n, log: [...n.log, { key: event, t: n.t }] };
        n = graduate(n);
      }
      n = { ...n, history: [...n.history, priceOf(n)] };
      if (n.t >= LAST) n.running = false;
      return n;
    }
    case "buy": {
      if (s.t < 0 || s.t >= LAST) return s;
      let n = buy(s, "you", s.size);
      n = { ...n, log: [...n.log, { key: "youBuy", t: s.t, sol: s.size, tok: n.last }], marks: [...n.marks, ["buy", s.t + 1]] };
      return graduate(n);
    }
    case "sell": {
      if (s.t < 0 || s.t >= LAST || s.book.you.tokens <= 0) return s;
      const n = sell(s, "you", 1);
      return { ...n, log: [...n.log, { key: "youSell", t: s.t, sol: n.last, tok: n.lastTok }], marks: [...n.marks, ["sell", s.t + 1]] };
    }
    default:
      return s;
  }
}

const pnl = (a, price) => a.got + a.tokens * price - a.spent;

// Chart: price per tick, linear scale, with the curve/DEX split and your trades.
const W = 480, H = 220, P = 14;
function Chart({ s, label, curveLabel, dexLabel }) {
  const max = Math.max(...s.history) * 1.12;
  const x = (i) => P + (i / (LAST + 1)) * (W - 2 * P);
  const y = (p) => H - P - (p / max) * (H - 2 * P);
  const line = s.history.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join("");
  const g = s.graduated === null ? null : x(s.graduated + 1);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="launch-chart">
      {g !== null && <rect x={g} y={P} width={W - P - g} height={H - 2 * P} className="launch-dex" />}
      <line x1={P} x2={W - P} y1={H - P} y2={H - P} className="launch-axis" />
      <text x={P + 4} y={P + 12} className="launch-phase">{curveLabel}</text>
      {g !== null && <text x={g + 6} y={P + 12} className="launch-phase dex">{dexLabel}</text>}
      <path d={line} className="launch-line" />
      {s.marks.map(([kind, i], k) => (
        <circle key={k} cx={x(i)} cy={y(s.history[Math.min(i, s.history.length - 1)])} r="5" className={`launch-mark ${kind}`} />
      ))}
    </svg>
  );
}

export default function LaunchSim() {
  const { t } = useLanguage();
  const L = t.memes.launch;
  const loc = t.locale;
  const [s, dispatch] = useReducer(reducer, null, initial);

  useEffect(() => {
    if (!s.running) return;
    const id = setInterval(() => dispatch({ type: "tick" }), TICK_MS);
    return () => clearInterval(id);
  }, [s.running]);

  const price = priceOf(s);
  const nf = (n, d = 2) => n.toLocaleString(loc, { maximumFractionDigits: d });
  const usd = (v) => new Intl.NumberFormat(loc, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
  const signed = (v) => `${v >= 0 ? "+" : "−"}${nf(Math.abs(v), 2)} SOL`;
  const realSol = s.graduated === null ? s.sol - V_SOL : null;
  const progress = s.graduated === null ? Math.min(1, (V_TOK - s.tok) / (V_TOK - GRAD_TOK)) : 1;
  const done = s.t >= LAST;
  const you = s.book.you;
  const started = s.t >= 0;
  const millions = (n) => `${nf(n / 1e6, 1)}M`;

  const line = (e) => {
    if (e.key === "youBuy") return L.events.youBuy(nf(e.sol, 1), millions(e.tok));
    if (e.key === "youSell") return L.events.youSell(millions(e.tok), nf(e.sol, 3));
    return L.events[e.key];
  };

  return (
    <section className="section section-ruled" id="launch">
      <div className="wrap">
        <SectionHead eyebrow={L.eyebrow} title={L.title} lede={L.lede} />
        <div className="launch reveal">
          <div className="panel">
            <div className="panel-head">
              <h3>{L.panel}</h3>
              <span>{s.graduated === null ? L.curve : L.dex}</span>
            </div>
            <dl className="stats-row">
              <div>
                <dt>{L.mcap}</dt>
                <dd>{usd(price * SUPPLY * SOL_USD)}</dd>
              </div>
              <div>
                <dt>{L.holding}</dt>
                <dd>{millions(you.tokens)}</dd>
              </div>
              <div>
                <dt>{L.pnl}</dt>
                <dd className={pnl(you, price) < 0 ? "down" : pnl(you, price) > 0 ? "up" : undefined}>{signed(pnl(you, price))}</dd>
              </div>
            </dl>
            <div className="launch-curve" aria-hidden="true">
              <span>{L.curve} {realSol === null ? "100%" : `${nf(progress * 100, 0)}% · ${nf(realSol, 1)} SOL`}</span>
              <div className="meter-bar"><i style={{ width: `${progress * 100}%` }} /></div>
            </div>
            <div className="controls">
              <div className="chips" role="group" aria-label={L.amount}>
                {[0.5, 1, 5].map((n) => (
                  <button key={n} type="button" aria-pressed={s.size === n} onClick={() => dispatch({ type: "size", size: n })}>
                    {nf(n, 1)}
                  </button>
                ))}
              </div>
              <button type="button" className="btn" onClick={() => dispatch({ type: "buy" })} disabled={!started || done}>
                {L.buy(nf(s.size, 1))}
              </button>
              <button type="button" className="btn ghost" onClick={() => dispatch({ type: "sell" })} disabled={!started || done || you.tokens <= 0}>
                {L.sell}
              </button>
            </div>
            <div className="controls">
              <button type="button" className="btn ghost" onClick={() => dispatch({ type: done ? "reset" : "toggle" })}>
                {done ? L.reset : s.running ? L.pause : started ? L.resume : L.start}
              </button>
              {started && !done && (
                <button type="button" className="btn ghost" onClick={() => dispatch({ type: "reset" })}>{L.reset}</button>
              )}
            </div>
            <ol className="launch-log" aria-live="polite">
              {s.log.slice(-6).map((e, i) => (
                <li key={`${e.t}-${e.key}-${i}`} className={e.key.startsWith("you") ? "you" : e.key === "devSell" || e.key === "panic" ? "bad" : undefined}>
                  {line(e)}
                </li>
              ))}
            </ol>
          </div>
          <div className="panel launch-side">
            <Chart s={s} label={L.chartAria} curveLabel={L.curve} dexLabel={L.dex} />
            {done && (
              <div className="launch-summary">
                <h4>{L.summary}</h4>
                <table>
                  <tbody>
                    {ACTORS.map((a) => {
                      const v = pnl(s.book[a], price);
                      return (
                        <tr key={a} className={a === "you" ? "you" : undefined}>
                          <th scope="row">{L.actors[a]}</th>
                          <td className={v < 0 ? "down" : "up"}>{signed(v)}</td>
                          <td>{usd(v * SOL_USD)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <p className="note">{L.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
