"use client";

import { useEffect, useState } from "react";
import { useLiveBitcoin } from "@/lib/useLiveBitcoin";
import { useLanguage } from "./LanguageProvider";
import SectionHead from "./SectionHead";

const HALVING_INTERVAL = 210_000;
const TEN_MINUTES = 600_000;

// Everything below is derived from the block height alone, so it stays exact
// even when only the height endpoint answers.
function fromHeight(height) {
  const epoch = Math.floor(height / HALVING_INTERVAL);
  const reward = 50 / 2 ** epoch;
  const nextHalving = (epoch + 1) * HALVING_INTERVAL;
  let mined = 0;
  for (let e = 0; e < epoch; e++) mined += HALVING_INTERVAL * (50 / 2 ** e);
  mined += (height - epoch * HALVING_INTERVAL + 1) * reward;
  return { reward, nextReward: reward / 2, nextHalving, blocksLeft: nextHalving - height, mined };
}

function useNow(every) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(id);
  }, [every]);
  return now;
}

function timeAgo(ms, locale) {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto", style: "short" });
  const s = Math.round((ms - Date.now()) / 1000);
  if (Math.abs(s) < 60) return rtf.format(s, "second");
  const m = Math.round(s / 60);
  if (Math.abs(m) < 60) return rtf.format(m, "minute");
  return rtf.format(Math.round(m / 60), "hour");
}

function Change({ value, locale }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return (
    <span className={`live-change ${up ? "up" : "down"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      {`${up ? "+" : "−"}${Math.abs(value).toLocaleString(locale, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}%`}
    </span>
  );
}

function Meter({ value, label }) {
  return (
    <div className="live-meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label={label}>
      <i style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export default function LiveBitcoin() {
  const { lang, t } = useLanguage();
  const L = t.live;
  const { price, network, failed, updatedAt, refresh } = useLiveBitcoin();
  const now = useNow(5_000);
  const loc = t.locale;
  const nf = (n, d = 0) => n.toLocaleString(loc, { maximumFractionDigits: d });
  const money = (n, cur) => new Intl.NumberFormat(loc, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);

  // Indonesian readers see rupiah first; English readers see dollars first.
  const primary = lang === "id" && price?.idr ? { v: price.idr, cur: "IDR", ch: price.changeIdr } : price && { v: price.usd, cur: "USD", ch: price.changeUsd };
  const secondary = lang === "id" ? price && { v: price.usd, cur: "USD" } : price?.idr && { v: price.idr, cur: "IDR" };

  const height = network?.height ?? null;
  const h = height !== null ? fromHeight(height) : null;
  const avgBlock = network?.difficulty?.timeAvg || TEN_MINUTES;
  const halvingDate = h
    ? new Date(now + h.blocksLeft * avgBlock).toLocaleDateString(loc, { day: "numeric", month: "short", year: "numeric" })
    : null;
  const lastBlockAt = network?.blocks?.[0]?.timestamp ? network.blocks[0].timestamp * 1000 : null;
  const fees = network?.fees;
  const diff = network?.difficulty;
  const allFailed = failed.price && failed.network && !price && !network;
  const someFailed = !allFailed && (failed.price || failed.network);

  return (
    <section className="section section-ruled" id="live" aria-live="off">
      <div className="wrap">
        <SectionHead eyebrow={L.eyebrow} title={L.title} lede={L.lede} />

        <div className="live-status reveal">
          <span className={`live-dot${allFailed ? " off" : updatedAt ? "" : " wait"}`} aria-hidden="true" />
          <span>{allFailed ? L.error : updatedAt ? L.updated(timeAgo(updatedAt, loc)) : L.connecting}</span>
          {(allFailed || someFailed) && (
            <button type="button" className="live-retry" onClick={refresh}>
              {L.retry}
            </button>
          )}
        </div>

        <div className="live-grid reveal">
          <article className="live-tile live-price">
            <h3>{L.price}</h3>
            <p className="live-big">{primary ? money(primary.v, primary.cur) : "—"}</p>
            <p className="live-sub">
              {secondary && <span>{money(secondary.v, secondary.cur)}</span>}
              {primary && <Change value={primary.ch} locale={loc} />}
              {primary?.ch !== null && primary?.ch !== undefined && <span className="live-muted">{L.change}</span>}
            </p>
          </article>

          <article className="live-tile">
            <h3>{L.height}</h3>
            <p className="live-num">{height !== null ? nf(height) : "—"}</p>
            <p className="live-sub live-muted">{lastBlockAt ? L.lastBlock(timeAgo(lastBlockAt, loc)) : " "}</p>
          </article>

          <article className="live-tile">
            <h3>{L.halving}</h3>
            <p className="live-num">{h ? L.blocksLeft(nf(h.blocksLeft)) : "—"}</p>
            <p className="live-sub live-muted">
              {h ? `${L.eta(halvingDate)} · ${L.reward(nf(h.reward, 5), nf(h.nextReward, 5))}` : " "}
            </p>
          </article>

          <article className="live-tile">
            <h3>{L.fees}</h3>
            <dl className="live-fees">
              <div>
                <dt>{L.fast}</dt>
                <dd>{fees ? nf(fees.fastestFee, 1) : "—"}</dd>
              </div>
              <div>
                <dt>{L.halfHour}</dt>
                <dd>{fees ? nf(fees.halfHourFee, 1) : "—"}</dd>
              </div>
              <div>
                <dt>{L.hour}</dt>
                <dd>{fees ? nf(fees.hourFee, 1) : "—"}</dd>
              </div>
            </dl>
          </article>

          <article className="live-tile">
            <h3>{L.difficulty}</h3>
            <p className="live-num">
              {diff ? `${diff.difficultyChange >= 0 ? "+" : "−"}${nf(Math.abs(diff.difficultyChange), 2)}%` : "—"}
            </p>
            <Meter value={diff?.progressPercent ?? 0} label={L.difficulty} />
            <p className="live-sub live-muted">
              {diff ? `${nf(diff.progressPercent, 1)}% · ${L.diffIn(nf(diff.remainingBlocks))}` : " "}
            </p>
          </article>

          <article className="live-tile">
            <h3>{L.supply}</h3>
            <p className="live-num">{h ? `${nf(h.mined / 1e6, 3)}${L.million}` : "—"}</p>
            <Meter value={h ? (h.mined / 21e6) * 100 : 0} label={L.supply} />
            <p className="live-sub live-muted">{h ? L.supplyOf(`${nf((h.mined / 21e6) * 100, 2)}%`) : " "}</p>
          </article>
        </div>

        <h3 className="live-blocks-title reveal">{L.latest}</h3>
        <ol className="live-blocks reveal">
          {(network?.blocks ?? Array.from({ length: 6 }, () => null)).map((b, i) => (
            <li key={b?.id ?? i} className={b ? undefined : "empty"}>
              {b ? (
                <a href={`https://mempool.space/block/${b.id}`} target="_blank" rel="noopener noreferrer">
                  <strong>{nf(b.height)}</strong>
                  <span>{timeAgo(b.timestamp * 1000, loc)}</span>
                  <span>{L.txs(nf(b.tx_count))} · {nf(b.size / 1e6, 2)} MB</span>
                  <span className="live-muted">{b.extras?.pool?.name ?? L.unknownPool}</span>
                </a>
              ) : (
                <span className="live-muted">—</span>
              )}
            </li>
          ))}
        </ol>

        {someFailed && <p className="note live-note">{L.partial}</p>}
        <p className="note live-note">
          {L.source}{" "}
          <a href="https://mempool.space" target="_blank" rel="noopener noreferrer">mempool.space</a> ·{" "}
          <a href="https://www.coingecko.com" target="_blank" rel="noopener noreferrer">CoinGecko</a>
        </p>
      </div>
    </section>
  );
}
