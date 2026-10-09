"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Public, keyless, CORS-enabled APIs. mempool.space is open source (github.com/mempool/mempool).
const MEMPOOL = "https://mempool.space/api";
const COINGECKO =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,idr&include_24hr_change=true";

const NETWORK_EVERY = 30_000;
const PRICE_EVERY = 60_000;

async function getJSON(url, signal) {
  const res = await fetch(url, { signal, cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

// CoinGecko gives USD + IDR with 24h change; if it fails (rate limit), fall back to
// mempool.space's USD-only price so the tile still shows something.
async function fetchPrice(signal) {
  try {
    const { bitcoin: b } = await getJSON(COINGECKO, signal);
    if (typeof b?.usd !== "number") throw new Error("bad price payload");
    return { usd: b.usd, idr: b.idr ?? null, changeUsd: b.usd_24h_change ?? null, changeIdr: b.idr_24h_change ?? null };
  } catch (err) {
    if (signal.aborted) throw err;
    const p = await getJSON(`${MEMPOOL}/v1/prices`, signal);
    return { usd: p.USD, idr: null, changeUsd: null, changeIdr: null };
  }
}

// Each piece settles on its own, so one failing endpoint never blanks the others.
async function fetchNetwork(signal) {
  const [height, fees, difficulty, blocks] = await Promise.allSettled([
    getJSON(`${MEMPOOL}/blocks/tip/height`, signal),
    getJSON(`${MEMPOOL}/v1/fees/recommended`, signal),
    getJSON(`${MEMPOOL}/v1/difficulty-adjustment`, signal),
    getJSON(`${MEMPOOL}/v1/blocks`, signal),
  ]);
  const ok = (r) => (r.status === "fulfilled" ? r.value : null);
  const blockList = ok(blocks);
  return {
    height: ok(height) ?? blockList?.[0]?.height ?? null,
    fees: ok(fees),
    difficulty: ok(difficulty),
    blocks: Array.isArray(blockList) ? blockList.slice(0, 6) : null,
  };
}

export function useLiveBitcoin() {
  const [price, setPrice] = useState(null);
  const [network, setNetwork] = useState(null);
  const [failed, setFailed] = useState({ price: false, network: false });
  const [updatedAt, setUpdatedAt] = useState(null);
  // One controller per kind, so the price poll never cancels an in-flight network poll.
  const ctrl = useRef({ price: null, network: null });

  const load = useCallback(async (kind) => {
    ctrl.current[kind]?.abort();
    const c = new AbortController();
    ctrl.current[kind] = c;
    if (kind === "price") {
      try {
        setPrice(await fetchPrice(c.signal));
        setFailed((f) => ({ ...f, price: false }));
      } catch {
        if (c.signal.aborted) return;
        setFailed((f) => ({ ...f, price: true }));
      }
    } else {
      const n = await fetchNetwork(c.signal);
      if (c.signal.aborted) return;
      const empty = n.height === null && !n.fees && !n.difficulty && !n.blocks;
      if (!empty) setNetwork(n);
      setFailed((f) => ({ ...f, network: empty }));
    }
    setUpdatedAt(Date.now());
  }, []);

  const refresh = useCallback(() => Promise.all([load("price"), load("network")]), [load]);

  useEffect(() => {
    let netTimer = 0;
    let priceTimer = 0;
    const start = () => {
      refresh();
      netTimer = setInterval(() => load("network"), NETWORK_EVERY);
      priceTimer = setInterval(() => load("price"), PRICE_EVERY);
    };
    const stop = () => {
      clearInterval(netTimer);
      clearInterval(priceTimer);
      ctrl.current.price?.abort();
      ctrl.current.network?.abort();
    };
    // Don't poll from a background tab; catch up as soon as it is visible again.
    const onVisibility = () => (document.hidden ? stop() : start());
    if (!document.hidden) start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load, refresh]);

  return { price, network, failed, updatedAt, refresh };
}

// Price only, fetched once on mount: for pages that value coins at today's price
// without polling the whole network.
export function useBtcPrice() {
  const [price, setPrice] = useState(null);
  useEffect(() => {
    const c = new AbortController();
    fetchPrice(c.signal).then(setPrice, () => {});
    return () => c.abort();
  }, []);
  return price;
}
