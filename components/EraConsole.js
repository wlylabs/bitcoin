"use client";

import {
  eraOf,
  formatHashrate,
  formatIdr,
  formatMonth,
  formatUsd,
  hardwareAt,
  MONTH_COUNT,
  monthIndex,
  PRICE_SERIES,
  snapshot,
  usdIdr,
} from "@/lib/history";
import EraWindow from "./EraWindow";
import { useLanguage } from "./LanguageProvider";

// Log-scale price line from July 2010 to the last month of data.
const W = 300, H = 64;
const LO = Math.log10(0.05), HI = Math.log10(150000);
const sx = (i) => (i / (MONTH_COUNT - 1)) * W;
const sy = (p) => H - 4 - ((Math.log10(p) - LO) / (HI - LO)) * (H - 8);
const LINE = PRICE_SERIES.map(([i, p], k) => `${k ? "L" : "M"}${sx(i).toFixed(1)} ${sy(p).toFixed(1)}`).join("");

function Sparkline({ ym, label }) {
  const i = monthIndex(ym);
  const s = snapshot(ym);
  const x = sx(i);
  return (
    <svg className="tm-spark" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
      <path d={LINE} className="tm-spark-line" vectorEffect="non-scaling-stroke" />
      <line x1={x} x2={x} y1="0" y2={H} className="tm-spark-now" vectorEffect="non-scaling-stroke" />
      {s.price && !s.early && <circle cx={x} cy={sy(s.price)} r="3" className="tm-spark-dot" />}
    </svg>
  );
}

export default function EraConsole({ ym }) {
  const { t } = useLanguage();
  const c = t.tm.console;
  const loc = t.locale;
  const era = eraOf(ym);
  const [eraName] = t.tm.eras[era.id];
  const s = snapshot(ym);
  const nf = (n, d = 0) => n.toLocaleString(loc, { maximumFractionDigits: d });

  return (
    <EraWindow skin={era.skin} title={c.titles[era.skin]} nav={c.forumNav} key={era.skin} className="tm-console" aria-label={c.aria} role="group">
      <div className="tm-when">
        <span className="tm-month">{formatMonth(ym, loc)}</span>
        <span className="tm-era">{eraName}</span>
      </div>
      {s.prelaunch ? (
        <div className="tm-prelaunch">
          <b>{c.prelaunch}</b>
          <p>{c.prelaunchNote}</p>
        </div>
      ) : (
        <>
          <div className="tm-price" aria-live="polite">
            <span className="tm-lbl">{c.price}</span>
            <b>{s.price ? formatUsd(s.price, loc) : c.noMarket}</b>
            {s.price ? (
              <small title={c.idrNote}>
                {s.early ? `${c.reference} · ` : ""}
                {formatIdr(s.price * usdIdr(ym), loc)}
              </small>
            ) : null}
          </div>
          <dl className="tm-stats">
            <div>
              <dt>{c.height}</dt>
              <dd>{nf(s.height)}</dd>
            </div>
            <div>
              <dt>{c.reward}</dt>
              <dd>{nf(s.reward, 3)} BTC</dd>
            </div>
            <div>
              <dt>{c.mined}</dt>
              <dd>{nf((s.supply / 21e6) * 100, 1)}%</dd>
            </div>
            <div>
              <dt>{c.hashrate}</dt>
              <dd>{s.hashrate ? formatHashrate(s.hashrate, loc) : "—"}</dd>
            </div>
            <div>
              <dt>{c.tx}</dt>
              <dd>{nf(s.txPerDay)}</dd>
            </div>
            <div>
              <dt>{c.fee}</dt>
              <dd>{s.fee === null ? "—" : formatUsd(s.fee, loc)}</dd>
            </div>
            <div className="tm-hw">
              <dt>{c.hardware}</dt>
              <dd>{t.tm.hardware[hardwareAt(ym)]}</dd>
            </div>
          </dl>
        </>
      )}
      <Sparkline ym={ym} label={c.chartAria} />
    </EraWindow>
  );
}
