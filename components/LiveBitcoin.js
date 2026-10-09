"use client";

import { useEffect, useState } from "react";
import { useLiveBitcoin } from "@/lib/useLiveBitcoin";
import BitcoinLogo from "./BitcoinLogo";
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
  return { reward, nextReward: reward / 2, blocksLeft: nextHalving - height, mined };
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

// Laid out after Bitcoin v0.1's main window (ui.cpp / uibase.cpp, January 2009):
// File/Options/Help menu, Send Coins / Address Book toolbar, address and balance
// rows, an "All Transactions" list with Status | Date | Description | Debit | Credit,
// and a three-field status bar. The chrome is decorative; the data is live.
// `head` overrides the section heading; `note` adds a line under the window.
export default function LiveBitcoin({ head, note }) {
  const { lang, t } = useLanguage();
  const L = t.live;
  const h0 = head ?? L;
  const { price, network, failed, updatedAt, refresh } = useLiveBitcoin();
  const now = useNow(5_000);
  const loc = t.locale;
  const nf = (n, d = 0) => n.toLocaleString(loc, { maximumFractionDigits: d });
  const money = (n, cur) => new Intl.NumberFormat(loc, { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(n);
  const btc = (n) => n.toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 3 });

  // Indonesian readers see rupiah first; English readers see dollars first.
  const primary =
    lang === "id" && price?.idr ? { v: price.idr, cur: "IDR", ch: price.changeIdr } : price && { v: price.usd, cur: "USD", ch: price.changeUsd };
  const secondary = lang === "id" ? price && { v: price.usd, cur: "USD" } : price?.idr && { v: price.idr, cur: "IDR" };

  const height = network?.height ?? null;
  const h = height !== null ? fromHeight(height) : null;
  const diff = network?.difficulty;
  const fees = network?.fees;
  const blocks = network?.blocks ?? [];
  const halvingDate = h
    ? new Date(now + h.blocksLeft * (diff?.timeAvg || TEN_MINUTES)).toLocaleDateString(loc, { day: "numeric", month: "short", year: "numeric" })
    : null;
  const allFailed = failed.price && failed.network && !price && !network;
  const someFailed = !allFailed && (failed.price || failed.network);
  const status = allFailed ? L.error : someFailed ? L.partial : updatedAt ? L.updated(timeAgo(updatedAt, loc)) : L.connecting;
  const date = (sec) => {
    const d = new Date(sec * 1000);
    return `${d.toLocaleDateString(loc, { day: "2-digit", month: "2-digit", year: "2-digit" })} ${d.toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit", hour12: false })}`;
  };

  return (
    <section className="section section-ruled" id="live">
      <div className="wrap">
        <SectionHead eyebrow={h0.eyebrow} title={h0.title} lede={h0.lede} />

        <div className="v01 reveal">
          <div className="v01-title">
            <BitcoinLogo size={16} />
            <span>Bitcoin</span>
            <span className="v01-caps" aria-hidden="true">
              <i>_</i>
              <i>□</i>
              <i>×</i>
            </span>
          </div>
          <div className="v01-menu" aria-hidden="true">
            <span><u>F</u>ile</span>
            <span><u>O</u>ptions</span>
            <span><u>H</u>elp</span>
          </div>
          <div className="v01-toolbar" aria-hidden="true">
            <span className="v01-tool">
              <BitcoinLogo size={14} />
              <span><u>S</u>end Coins</span>
            </span>
            <span className="v01-tool">
              <span className="v01-book" />
              <span><u>A</u>ddress Book</span>
            </span>
          </div>

          <div className="v01-body">
            <div className="v01-row">
              <span className="v01-label">{L.latestBlock}</span>
              {blocks[0] ? (
                <a className="v01-field v01-hash" href={`https://mempool.space/block/${blocks[0].id}`} target="_blank" rel="noopener noreferrer">
                  {blocks[0].id}
                </a>
              ) : (
                <span className="v01-field v01-hash">{" "}</span>
              )}
            </div>
            <div className="v01-row">
              <span className="v01-label">{L.price}</span>
              <span className="v01-balance">{primary ? money(primary.v, primary.cur) : "—"}</span>
              {primary?.ch !== null && primary?.ch !== undefined && (
                <span className={`v01-change ${primary.ch >= 0 ? "up" : "down"}`}>
                  {primary.ch >= 0 ? "▲ +" : "▼ −"}
                  {Math.abs(primary.ch).toLocaleString(loc, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% {L.change}
                </span>
              )}
              {secondary && <span className="v01-dim">{money(secondary.v, secondary.cur)}</span>}
            </div>
            <div className="v01-row">
              <span className="v01-label">{L.halving}</span>
              <span>{h ? L.halvingValue(nf(h.blocksLeft), halvingDate, nf(h.reward, 4), nf(h.nextReward, 4)) : "—"}</span>
            </div>
            <div className="v01-row">
              <span className="v01-label">{L.network}</span>
              <span>
                {h && diff
                  ? L.networkValue(
                      nf(h.mined / 1e6, 3),
                      `${nf((h.mined / 21e6) * 100, 2)}%`,
                      `${diff.difficultyChange >= 0 ? "+" : "−"}${nf(Math.abs(diff.difficultyChange), 2)}%`,
                      nf(diff.remainingBlocks)
                    )
                  : "—"}
              </span>
            </div>

            <div className="v01-tabs">
              <span className="v01-tab">{L.tab}</span>
            </div>
            <div className="v01-list">
              <table>
                <thead>
                  <tr>
                    {L.cols.map((c, i) => (
                      <th key={c} className={i > 2 ? "num" : undefined}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(blocks.length ? blocks : Array.from({ length: 6 }, () => null)).map((b, i) =>
                    b ? (
                      <tr key={b.id}>
                        <td>{L.depth(height !== null ? height - b.height + 1 : i + 1)}</td>
                        <td>{date(b.timestamp)}</td>
                        <td>
                          <a href={`https://mempool.space/block/${b.id}`} target="_blank" rel="noopener noreferrer">
                            #{nf(b.height)} · {L.desc(b.extras?.pool?.name ?? L.unknownPool, nf(b.tx_count), nf(b.size / 1e6, 2))}
                          </a>
                        </td>
                        <td className="num" />
                        <td className="num">{btc(b.extras?.reward ? b.extras.reward / 1e8 : fromHeight(b.height).reward)}</td>
                      </tr>
                    ) : (
                      <tr key={i} className="empty">
                        <td colSpan={5}>{" "}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="v01-status">
            <span className="v01-cell grow">
              {status}
              {(allFailed || someFailed) && (
                <button type="button" className="v01-button" onClick={refresh}>
                  {L.retry}
                </button>
              )}
            </span>
            <span className="v01-cell">{fees ? L.fee(nf(fees.fastestFee, 1)) : "—"}</span>
            <span className="v01-cell">{height !== null ? L.blocks(nf(height + 1)) : "—"}</span>
          </div>
        </div>
        {note && <p className="live-note reveal">{note}</p>}
      </div>
    </section>
  );
}
