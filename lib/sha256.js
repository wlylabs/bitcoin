// SHA-256 (FIPS 180-4) in plain JavaScript, so hashing works without crypto.subtle
// and stays synchronous for the miner loop.
const K = new Uint32Array(64);
const H0 = new Uint32Array(8);
(() => {
  const frac = (x) => ((x - Math.floor(x)) * 0x100000000) >>> 0;
  let n = 0;
  let p = 2;
  while (n < 64) {
    let prime = true;
    for (let d = 2; d * d <= p; d++) if (p % d === 0) { prime = false; break; }
    if (prime) {
      if (n < 8) H0[n] = frac(Math.sqrt(p));
      K[n++] = frac(Math.cbrt(p));
    }
    p++;
  }
})();
const W = new Uint32Array(64);

export function sha256(bytes) {
  const len = bytes.length;
  const bitLen = len * 8;
  const total = ((len + 9 + 63) >> 6) << 6;
  const m = new Uint8Array(total);
  m.set(bytes);
  m[len] = 0x80;
  const dv = new DataView(m.buffer);
  dv.setUint32(total - 8, Math.floor(bitLen / 0x100000000));
  dv.setUint32(total - 4, bitLen >>> 0);
  const h = H0.slice();
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = dv.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const a = W[i - 15];
      const b = W[i - 2];
      const s0 = ((a >>> 7) | (a << 25)) ^ ((a >>> 18) | (a << 14)) ^ (a >>> 3);
      const s1 = ((b >>> 17) | (b << 15)) ^ ((b >>> 19) | (b << 13)) ^ (b >>> 10);
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) | 0;
    }
    let a = h[0], b = h[1], c = h[2], d = h[3], e = h[4], f = h[5], g = h[6], k = h[7];
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const t1 = (k + S1 + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      k = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h[0] += a; h[1] += b; h[2] += c; h[3] += d; h[4] += e; h[5] += f; h[6] += g; h[7] += k;
  }
  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  for (let i = 0; i < 8; i++) ov.setUint32(i * 4, h[i]);
  return out;
}

const enc = new TextEncoder();
export const utf8 = (s) => enc.encode(s);
export const toHex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
export const fromHex = (s) => new Uint8Array(s.match(/../g).map((x) => parseInt(x, 16)));
export const sha256hex = (s) => toHex(sha256(utf8(s)));
