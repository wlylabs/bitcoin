// Structure of the Time Machine and Satoshi's Wallet: eras, moments, and helpers over
// the monthly network data. All copy lives in lib/content.js, keyed by the ids here.
import { HISTORY } from "./history-data";

// Each era has its own window chrome ("skin") in the Time Machine console and in
// the wallet game. `from` is the first month of the era.
export const ERAS = [
  { id: "genesis", from: "2008-08", skin: "classic" },
  { id: "experiment", from: "2010-05", skin: "forum" },
  { id: "crisis", from: "2014-01", skin: "exchange" },
  { id: "maturity", from: "2017-08", skin: "mobile" },
  { id: "institutional", from: "2021-01", skin: "modern" },
];

export function eraOf(ym) {
  let era = ERAS[0];
  for (const e of ERAS) if (ym >= e.from) era = e;
  return era;
}

// Moments of the timeline in order. `hot` marks key moments, `src` points at
// lib/sources.js, `play` names a hands-on demo shown with the moment.
export const MOMENTS = [
  { id: "domain", ym: "2008-08" },
  { id: "whitepaper", ym: "2008-10", hot: true, src: "whitepaper" },
  { id: "genesis", ym: "2009-01", hot: true, play: "mine", src: "lmab" },
  { id: "v01", ym: "2009-01", src: "core" },
  { id: "hal", ym: "2009-01", play: "send", src: "block170" },
  { id: "firstPrice", ym: "2009-10", src: "btcwiki" },
  { id: "pizza", ym: "2010-05", hot: true, play: "pizza", src: "pizza" },
  { id: "mtgoxOpens", ym: "2010-07", src: "mtgox" },
  { id: "overflow", ym: "2010-08", src: "overflow" },
  { id: "satoshiGone", ym: "2010-12", src: "nakamoto" },
  { id: "parity", ym: "2011-02", src: "btcwiki" },
  { id: "silkRoad", ym: "2011-02" },
  { id: "goxHack", ym: "2011-06", src: "mtgox" },
  { id: "halving1", ym: "2012-11", hot: true },
  { id: "fork2013", ym: "2013-03", src: "bip50" },
  { id: "silkRoadDown", ym: "2013-10" },
  { id: "howells", ym: "2013-11" },
  { id: "thousand", ym: "2013-11" },
  { id: "goxCollapse", ym: "2014-02", hot: true, play: "gox", src: "mtgox" },
  { id: "blocksizeWar", ym: "2015-08" },
  { id: "halving2", ym: "2016-07" },
  { id: "bch", ym: "2017-08" },
  { id: "segwit", ym: "2017-08", hot: true, src: "bip141" },
  { id: "s2x", ym: "2017-11" },
  { id: "mania", ym: "2017-12", play: "fees" },
  { id: "lightning", ym: "2018-03", play: "lightning", src: "bolts" },
  { id: "winter", ym: "2018-12" },
  { id: "covid", ym: "2020-03" },
  { id: "halving3", ym: "2020-05" },
  { id: "microstrategy", ym: "2020-08" },
  { id: "tesla", ym: "2021-02" },
  { id: "chinaBan", ym: "2021-06" },
  { id: "elSalvador", ym: "2021-09", src: "elsalvador" },
  { id: "taproot", ym: "2021-11", hot: true, src: "bip341" },
  { id: "terra", ym: "2022-05" },
  { id: "ftx", ym: "2022-11", src: "ftx" },
  { id: "ordinals", ym: "2023-01", src: "ord" },
  { id: "etf", ym: "2024-01", hot: true, src: "secetf" },
  { id: "halving4", ym: "2024-04", hot: true },
  { id: "hundredK", ym: "2024-12" },
  { id: "reserve", ym: "2025-03", src: "reserve" },
  { id: "ath2025", ym: "2025-10" },
];

// Months from August 2008 (the domain registration) to the last month of data.
// Months before the first block have no row in HISTORY.
export const FIRST_MONTH = "2008-08";
export const LAST_MONTH = HISTORY[HISTORY.length - 1][0];

const toIndex = (ym) => (Number(ym.slice(0, 4)) - 2008) * 12 + Number(ym.slice(5, 7)) - 8;
export const MONTH_COUNT = toIndex(LAST_MONTH) + 1;
export const monthIndex = (ym) => Math.min(MONTH_COUNT - 1, Math.max(0, toIndex(ym)));
export function monthAt(i) {
  const n = i + 7; // months since January 2008
  return `${2008 + Math.floor(n / 12)}-${String((n % 12) + 1).padStart(2, "0")}`;
}

const BY_MONTH = new Map(HISTORY.map((r) => [r[0], r]));

// Approximate annual average USD → IDR rate, for showing historical prices in rupiah.
const USD_IDR = {
  2008: 9700, 2009: 10400, 2010: 9090, 2011: 8770, 2012: 9390, 2013: 10450, 2014: 11870, 2015: 13390,
  2016: 13310, 2017: 13380, 2018: 14240, 2019: 14150, 2020: 14580, 2021: 14310, 2022: 14850,
  2023: 15240, 2024: 15850, 2025: 16450, 2026: 16700,
};
export const usdIdr = (ym) => USD_IDR[Number(ym.slice(0, 4))] ?? USD_IDR[2026];

// Before Mt. Gox there was no market price, only two widely cited reference points.
const EARLY_PRICES = [
  ["2009-10", 1 / 1309.03], // New Liberty Standard's first exchange rate
  ["2010-05", 41 / 10000], // Pizza Day: about $41 for 10,000 BTC
];

// What a typical miner ran: laptops, then GPUs (autumn 2010), FPGA boards, the
// first ASICs (Avalon, early 2013) and finally industrial farms.
const HARDWARE = [["2009-01", "cpu"], ["2010-10", "gpu"], ["2012-06", "fpga"], ["2013-02", "asic"], ["2016-01", "farm"]];
export function hardwareAt(ym) {
  let hw = "none";
  for (const [m, h] of HARDWARE) if (ym >= m) hw = h;
  return hw;
}

export function rewardAt(height) {
  return 50 / 2 ** Math.floor(height / 210000);
}

// Network snapshot for a month. `early` marks a price that is a reference point, not a market.
export function snapshot(ym) {
  const row = BY_MONTH.get(ym);
  if (!row) return { ym, prelaunch: true };
  const [, price, hashrate, height, supply, txPerDay, fee] = row;
  let early = null;
  if (price === null) for (const [m, p] of EARLY_PRICES) if (ym >= m) early = p;
  return { ym, price: price ?? early, early: price === null && early !== null, hashrate, height, supply, txPerDay, fee, reward: rewardAt(height) };
}

export const LATEST = snapshot(LAST_MONTH);

// Close prices with a value, for the console sparkline.
export const PRICE_SERIES = HISTORY.filter((r) => r[1] !== null).map((r) => [monthIndex(r[0]), r[1]]);

// "1.23 EH/s" from a hashrate in TH/s.
export function formatHashrate(th, locale) {
  const units = ["H/s", "kH/s", "MH/s", "GH/s", "TH/s", "PH/s", "EH/s", "ZH/s"];
  let v = th * 1e12;
  let u = 0;
  while (v >= 1000 && u < units.length - 1) {
    v /= 1000;
    u++;
  }
  return `${v.toLocaleString(locale, { maximumFractionDigits: v < 10 ? 2 : v < 100 ? 1 : 0 })} ${units[u]}`;
}

// Price with enough decimals to show sub-cent early prices.
export function formatUsd(v, locale) {
  const d = v < 0.01 ? 5 : v < 0.1 ? 4 : v < 100 ? 2 : 0;
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD", minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

export function formatIdr(v, locale) {
  const d = v < 10 ? 2 : 0;
  return new Intl.NumberFormat(locale, { style: "currency", currency: "IDR", minimumFractionDigits: d, maximumFractionDigits: d }).format(v);
}

// Localized "May 2010" for a "2010-05" key.
export function formatMonth(ym, locale) {
  return new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1, 15)).toLocaleDateString(locale, { month: "short", year: "numeric", timeZone: "UTC" });
}
