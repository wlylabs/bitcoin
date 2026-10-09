"use client";

import { useEffect, useRef, useState } from "react";
import { formatIdr, formatMonth, formatUsd, LAST_MONTH, LATEST, snapshot, usdIdr } from "@/lib/history";
import { startMining } from "@/lib/mine";
import { useBtcPrice } from "@/lib/useLiveBitcoin";
import Rich from "./Rich";

// Hands-on demos shown with a moment in the Time Machine. Each gets the moment's
// copy (`d`), the full language pack (`t`) and renders inside an EraWindow.

// Reveal `steps` one at a time; returns [shown, start, reset].
function useSteps(count, every) {
  const [shown, setShown] = useState(0);
  const timer = useRef(0);
  useEffect(() => () => clearInterval(timer.current), []);
  const start = () => {
    clearInterval(timer.current);
    setShown(1);
    timer.current = setInterval(() => {
      setShown((n) => {
        if (n + 1 >= count) clearInterval(timer.current);
        return Math.min(count, n + 1);
      });
    }, every);
  };
  const reset = () => {
    clearInterval(timer.current);
    setShown(0);
  };
  return [shown, start, reset];
}

function Mine({ d, t }) {
  const [state, setState] = useState({ phase: "idle" });
  const halt = useRef(null);
  useEffect(() => () => halt.current?.(), []);
  const loc = t.locale;

  const start = () => {
    setState({ phase: "mining", nonce: 0 });
    halt.current = startMining({
      data: "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks",
      zeros: 4,
      onTick: ({ nonce }) => setState({ phase: "mining", nonce }),
      onFound: (r) => setState({ phase: "found", ...r }),
    });
  };
  const stop = () => {
    halt.current?.();
    setState({ phase: "idle" });
  };

  // Hashes a real block needs on average today ≈ network hashrate × 600 s.
  let years = null;
  if (state.phase === "found") {
    const y = (LATEST.hashrate * 1e12 * 600) / state.rate / 31_536_000;
    years = y.toLocaleString(loc, { notation: "compact", compactDisplay: "long", maximumFractionDigits: 1 });
  }

  return (
    <div className="demo">
      <p className="demo-lede">{d.lede}</p>
      <div className="demo-hash mono">
        {state.phase === "found" ? (
          <>
            <span className="z">{state.hash.slice(0, 4)}</span>
            {state.hash.slice(4)}
          </>
        ) : (
          "SHA256(\"The Times 03/Jan/2009…\" + nonce)"
        )}
      </div>
      <div className="demo-row">
        <button type="button" className="demo-btn" onClick={state.phase === "mining" ? stop : start}>
          {state.phase === "mining" ? d.stop : d.start}
        </button>
        <span className="demo-note" aria-live="polite">
          {state.phase === "mining" && d.searching(state.nonce.toLocaleString(loc))}
          {state.phase === "found" && d.found(state.tries.toLocaleString(loc), state.secs.toFixed(2))}
        </span>
      </div>
      {years && <p className="demo-foot">{d.compare(years)}</p>}
    </div>
  );
}

function Send({ d }) {
  const [shown, start, reset] = useSteps(d.steps.length, 900);
  const done = shown === d.steps.length;
  return (
    <div className="demo">
      <p className="demo-lede">{d.lede}</p>
      <div className="demo-tx">
        <div>
          <span className="demo-lbl">{d.input}</span>
          <span className="demo-io">{d.inputValue}</span>
        </div>
        <span className="demo-arrow" aria-hidden="true">→</span>
        <div>
          <span className="demo-lbl">{d.outputs}</span>
          <span className={`demo-io${done ? " ok" : ""}`}>{d.toHal}</span>
          <span className="demo-io">{d.change}</span>
        </div>
      </div>
      <ol className="demo-steps" aria-live="polite">
        {d.steps.slice(0, shown).map((s, i) => (
          <li key={i} className={i === d.steps.length - 1 ? "ok" : undefined}>{s}</li>
        ))}
      </ol>
      <div className="demo-row">
        <button type="button" className="demo-btn" onClick={done ? reset : start} disabled={shown > 0 && !done}>
          {done ? d.again : <Rich html={d.button} />}
        </button>
      </div>
    </div>
  );
}

// Moments to value the pizza coins at: the 2013, 2017 and 2021 peaks, $100K, latest data.
const PIZZA_MONTHS = ["2013-11", "2017-12", "2021-11", "2024-12"];

function Pizza({ d, t }) {
  const live = useBtcPrice();
  const loc = t.locale;
  const rows = [[d.paid, 41, 41 * usdIdr("2010-05")]];
  for (const m of PIZZA_MONTHS) {
    const p = snapshot(m).price;
    rows.push([formatMonth(m, loc), p * 10000, p * 10000 * usdIdr(m)]);
  }
  if (live) rows.push([d.nowLive, live.usd * 10000, (live.idr ?? live.usd * usdIdr(LAST_MONTH)) * 10000]);
  else rows.push([d.nowData(formatMonth(LAST_MONTH, loc)), LATEST.price * 10000, LATEST.price * 10000 * usdIdr(LAST_MONTH)]);
  // "$5.6 million": spelled-out units instead of compact notation, whose output
  // differs between the server's and the browser's ICU and breaks hydration.
  const big = (v, currency) => {
    const [div, word] = d.units.find(([n]) => v >= n) ?? [1, ""];
    const n = new Intl.NumberFormat(loc, { style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: div > 1 ? 1 : 0 }).format(v / div);
    return word ? `${n} ${word}` : n;
  };
  const money = (v) => big(v, "USD");
  const rupiah = (v) => big(v, "IDR");
  return (
    <div className="demo">
      <p className="demo-lede">{d.lede}</p>
      <table className="demo-table">
        <tbody>
          {rows.map(([label, usd, idr], i) => (
            <tr key={label} className={i === rows.length - 1 ? "now" : undefined}>
              <th scope="row">{label}</th>
              <td>
                <b>{money(usd)}</b>
                <small>{rupiah(idr)}</small>
              </td>
              <td className="demo-dim">{d.perPizza(money(usd / 2))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Gox({ d }) {
  const [shown, start, reset] = useSteps(d.steps.length, 1300);
  const done = shown === d.steps.length;
  return (
    <div className="demo">
      <p className="demo-lede">{d.lede}</p>
      <div className="demo-balance mono">
        <span>BTC</span>
        <b className={done ? "gone" : undefined}>10.00000000</b>
      </div>
      <ol className="demo-steps" aria-live="polite">
        {d.steps.slice(0, shown).map((s, i) => (
          <li key={i} className={i >= 2 ? "bad" : undefined}>{s}</li>
        ))}
      </ol>
      {done && <p className="demo-foot">{d.lesson}</p>}
      <div className="demo-row">
        <button type="button" className="demo-btn" onClick={done ? reset : start} disabled={shown > 0 && !done}>
          {done ? d.again : d.button}
        </button>
      </div>
    </div>
  );
}

// sat/vB options and the wait each buys in the December 2017 mempool (simplified).
const FEE_RATES = [20, 100, 300, 600];

function Fees({ d, t }) {
  const [pick, setPick] = useState(1);
  const rate = FEE_RATES[pick];
  const usd = (rate * 226 * 19250) / 1e8;
  return (
    <div className="demo">
      <p className="demo-lede">{d.lede}</p>
      <div className="demo-row" role="group" aria-label={d.pick}>
        {FEE_RATES.map((r, i) => (
          <button key={r} type="button" className="demo-chip" aria-pressed={pick === i} onClick={() => setPick(i)}>
            {r} sat/vB
          </button>
        ))}
      </div>
      <dl className="demo-kv" aria-live="polite">
        <div>
          <dt>{d.cost}</dt>
          <dd>{formatUsd(usd, t.locale)}</dd>
        </div>
        <div>
          <dt>{d.wait}</dt>
          <dd>{d.waits[pick]}</dd>
        </div>
      </dl>
      <p className="demo-foot">{d.note}</p>
    </div>
  );
}

function Lightning({ d }) {
  const [run, setRun] = useState(0); // bumps on every payment to restart the animation
  const [done, setDone] = useState({ ln: false, chain: false });
  const timers = useRef([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const pay = () => {
    timers.current.forEach(clearTimeout);
    setDone({ ln: false, chain: false });
    setRun((r) => r + 1);
    timers.current = [
      setTimeout(() => setDone((x) => ({ ...x, ln: true })), 600),
      setTimeout(() => setDone((x) => ({ ...x, chain: true })), 10_000),
    ];
  };
  const lanes = [
    ["ln", d.ln, "0.6s", d.took[0]],
    ["chain", d.onchain, "10s", d.took[1]],
  ];
  return (
    <div className="demo">
      <p className="demo-lede">{d.lede}</p>
      <div className="demo-lanes">
        {lanes.map(([key, label, dur, took]) => (
          <div key={key} className="demo-lane">
            <span className="demo-lbl">{label}</span>
            <div className="demo-track">
              {run > 0 && <i key={run} style={{ animationDuration: dur }} />}
            </div>
            <span className="demo-note" aria-live="polite">
              {run > 0 && (done[key] ? d.done(took) : d.waiting)}
            </span>
          </div>
        ))}
      </div>
      <div className="demo-row">
        <button type="button" className="demo-btn" onClick={pay}>
          {run > 0 && done.chain ? d.again : d.button}
        </button>
      </div>
    </div>
  );
}

export const DEMOS = { mine: Mine, send: Send, pizza: Pizza, gox: Gox, fees: Fees, lightning: Lightning };
