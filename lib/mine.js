import { sha256, toHex, utf8 } from "./sha256";

// Proof-of-work in the browser: hash `data + nonce` until the hex digest starts with
// `zeros` zeros. Work runs in ~24 ms slices so the page stays responsive.
// Returns a function that stops the search.
export function startMining({ data, zeros, onTick, onFound }) {
  const prefix = "0".repeat(zeros);
  const base = utf8(data);
  const t0 = performance.now();
  let nonce = 0;
  let timer = 0;
  let running = true;

  const chunk = () => {
    if (!running) return;
    const tEnd = performance.now() + 24;
    let hex = "";
    while (performance.now() < tEnd) {
      for (let j = 0; j < 200; j++) {
        const ns = utf8(String(nonce));
        const buf = new Uint8Array(base.length + ns.length);
        buf.set(base);
        buf.set(ns, base.length);
        hex = toHex(sha256(buf));
        if (hex.startsWith(prefix)) {
          running = false;
          const secs = (performance.now() - t0) / 1000;
          onFound({ hash: hex, nonce, tries: nonce + 1, secs, rate: (nonce + 1) / Math.max(secs, 0.001) });
          return;
        }
        nonce++;
      }
    }
    const secs = (performance.now() - t0) / 1000;
    onTick?.({ hash: hex, nonce, secs, rate: nonce / Math.max(secs, 0.001) });
    timer = setTimeout(chunk, 0);
  };
  chunk();

  return () => {
    running = false;
    clearTimeout(timer);
  };
}
