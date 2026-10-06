"use client";

import { useEffect, useRef, useState } from "react";
import { fromHex, sha256, toHex } from "@/lib/sha256";
import { useLanguage } from "./LanguageProvider";
import SectionHead from "./SectionHead";

// The 80-byte genesis block header, field by field, in serialized (little-endian) order.
const FIELDS = [
  ["v", "01000000", "#b9a6ff"],
  ["p", "0".repeat(64), "#5d5d6b"],
  ["m", "3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a", "#7cc7ff"],
  ["t", "29ab5f49", "#3ddc97"],
  ["b", "ffff001d", "#ff8fa3"],
  ["n", "1dac2b7c", "#f7931a"],
];
const HEADER = FIELDS.map((f) => f[1]).join("");
const EXPECT = "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f";
const VALUES = ["1", "0000…0000", "4a5e1e4b…a33b", null, "1d00ffff", "2083236893"];

export default function Genesis() {
  const { t } = useLanguage();
  const g = t.genesis;
  const [result, setResult] = useState(null); // { hash, ok, shown }
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const verify = () => {
    const hash = toHex(sha256(sha256(fromHex(HEADER))).reverse());
    const ok = hash === EXPECT;
    const step = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 64 : 2;
    cancelAnimationFrame(raf.current);
    // Type the hash out a couple of characters per frame.
    const tick = (shown) => {
      setResult({ hash, ok, shown });
      if (shown < 64) raf.current = requestAnimationFrame(() => tick(Math.min(64, shown + step)));
    };
    tick(step);
  };

  return (
    <section className="section section-ruled" id="genesis">
      <div className="wrap">
        <SectionHead eyebrow={g.eyebrow} title={g.title} lede={g.lede} />
        <div className="genesis">
          <div className="panel reveal">
            <blockquote className="coinbase">
              &quot;The Times 03/Jan/2009 Chancellor on brink of second bailout for banks&quot;
            </blockquote>
            <table className="header-table">
              <tbody>
                {g.rows.map((label, i) => (
                  <tr key={i}>
                    <th>{label}</th>
                    <td>
                      {VALUES[i] ?? (
                        <>
                          1231006505 <span className="when">· 18:15:05 UTC</span>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel reveal">
            <div className="panel-head">
              <h3>{g.raw}</h3>
              <span>little-endian</span>
            </div>
            <div className="hexdump">
              {FIELDS.map(([k, hex, color]) => (
                <span key={k} style={{ color }}>{hex}</span>
              ))}
            </div>
            <div className="legend">
              {g.legend.map((name, i) => (
                <span key={i} style={{ "--c": FIELDS[i][2] }}>{name}</span>
              ))}
            </div>
            <div className="controls">
              <button className="btn" type="button" onClick={verify}>{g.button}</button>
            </div>
            <div className={`verify-result${result?.ok ? " ok" : ""}`} aria-live="polite">
              {result ? (
                <>
                  <span style={{ color: "var(--faint)" }}>{g.reversed}</span>
                  <span className="hash">{result.hash.slice(0, result.shown)}</span>
                  {result.shown >= 64 && (result.ok ? <span className="okmark">{g.ok}</span> : g.fail)}
                </>
              ) : (
                g.idle
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
