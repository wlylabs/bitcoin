"use client";

import { useEffect, useRef, useState } from "react";
import { startMining } from "@/lib/mine";
import { sha256hex } from "@/lib/sha256";
import { useLanguage } from "./LanguageProvider";
import SectionHead from "./SectionHead";

function bitsDiff(a, b) {
  let n = 0;
  for (let i = 0; i < 64; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    while (x) {
      n += x & 1;
      x >>= 1;
    }
  }
  return n;
}

function Avalanche({ t }) {
  const [input, setInput] = useState(t.lab.defaultInput);
  const [state, setState] = useState(() => ({ hash: sha256hex(t.lab.defaultInput), prev: null, version: 0 }));

  const onChange = (e) => {
    const value = e.target.value;
    setInput(value);
    setState((s) => ({ hash: sha256hex(value), prev: s.hash, version: s.version + 1 }));
  };

  const { hash, prev, version } = state;
  const bits = prev && prev !== hash ? bitsDiff(prev, hash) : null;
  const pct = bits === null ? 0 : Math.round((bits / 256) * 100);

  return (
    <div className="panel reveal">
      <div className="panel-head">
        <h3>{t.lab.avalanche}</h3>
        <span>SHA-256</span>
      </div>
      <label className="field">
        {t.lab.input}
        <textarea className="input" rows={3} spellCheck={false} value={input} onChange={onChange} />
      </label>
      <div>
        <div className="field" style={{ marginBottom: 8 }}>{t.lab.output}</div>
        <div className="hash-out" aria-live="polite">
          {/* Changed characters get a fresh key so their highlight animation restarts. */}
          {Array.from(hash, (ch, i) => {
            const flip = prev && prev[i] !== ch;
            return (
              <span key={flip ? `${i}-${version}` : i} className={flip ? "c flip" : "c"}>
                {ch}
              </span>
            );
          })}
        </div>
      </div>
      <div className="meter">
        <span>{bits === null ? t.lab.changeOne : t.lab.bitsChanged(bits)}</span>
        <div className="meter-bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <span>{pct}%</span>
      </div>
      <p className="note">{t.lab.avalancheNote}</p>
    </div>
  );
}

const fmtRate = (n) => (n >= 1e6 ? (n / 1e6).toFixed(2) + " M" : n >= 1e3 ? (n / 1e3).toFixed(1) + " k" : String(Math.round(n)));

function Miner({ t }) {
  const [data, setData] = useState(null); // null = follow the language's default text
  const [difficulty, setDifficulty] = useState(4);
  const [mining, setMining] = useState(false);
  const [stats, setStats] = useState({ hash: null, zeros: 0, nonce: 0, rate: null, time: null });
  const [note, setNote] = useState({ key: "idle" });
  const halt = useRef(null);

  const nf = (n) => n.toLocaleString(t.locale);
  const value = data ?? t.lab.defaultBlock;

  useEffect(() => () => halt.current?.(), []);

  const stop = (next) => {
    halt.current?.();
    halt.current = null;
    setMining(false);
    if (next) setNote(next);
  };

  const start = () => {
    const d = difficulty;
    setMining(true);
    setNote({ key: "searching" });
    halt.current = startMining({
      data: value,
      zeros: d,
      onTick: ({ hash, nonce, secs, rate }) => setStats({ hash, zeros: 0, nonce, rate, time: secs.toFixed(1) + " s" }),
      onFound: ({ hash, nonce, tries, secs, rate }) => {
        setStats({ hash, zeros: d, nonce, rate, time: secs.toFixed(2) + " s" });
        stop({ key: "found", n: tries });
      },
    });
  };

  return (
    <div className="panel reveal">
      <div className="panel-head">
        <h3>{t.lab.miner}</h3>
        <span>proof-of-work</span>
      </div>
      <label className="field">
        {t.lab.blockData}
        <input className="input" spellCheck={false} value={value} onChange={(e) => setData(e.target.value)} />
      </label>
      <div className="controls">
        <span className="field" style={{ flexDirection: "row", alignItems: "center" }}>{t.lab.zeros}</span>
        <div className="chips" role="group" aria-label={t.lab.difficulty}>
          {[2, 3, 4, 5].map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={difficulty === d}
              onClick={() => {
                setDifficulty(d);
                setNote({ key: "avg", n: 16 ** d });
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="hash-out">
        {stats.hash ? (
          <>
            <span className="z">{stats.hash.slice(0, stats.zeros)}</span>
            {stats.hash.slice(stats.zeros)}
          </>
        ) : (
          "SHA256( data + nonce ) …"
        )}
      </div>
      <dl className="stats-row">
        <div>
          <dt>{t.lab.nonce}</dt>
          <dd>{nf(stats.nonce)}</dd>
        </div>
        <div>
          <dt>{t.lab.rate}</dt>
          <dd>{stats.rate === null ? "—" : fmtRate(stats.rate)}</dd>
        </div>
        <div>
          <dt>{t.lab.time}</dt>
          <dd>{stats.time ?? "—"}</dd>
        </div>
      </dl>
      <div className="controls">
        <button className="btn" type="button" onClick={() => (mining ? stop({ key: "stopped" }) : start())}>
          {mining ? t.lab.stop : t.lab.start}
        </button>
        <span className="note">{t.lab.notes[note.key](note.n === undefined ? undefined : nf(note.n))}</span>
      </div>
    </div>
  );
}

export default function Lab() {
  const { t } = useLanguage();
  return (
    <section className="section" id="lab">
      <div className="wrap">
        <SectionHead as="h1" eyebrow={t.lab.eyebrow} title={t.lab.title} lede={t.lab.lede} />
        <div className="lab">
          <Avalanche t={t} />
          <Miner t={t} />
        </div>
      </div>
    </section>
  );
}
