"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

function Card({ span, card, children }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <article className={`card ${span} reveal`} onPointerMove={onMove}>
      <div className="kicker">{card.kicker}</div>
      <Rich as="h3" html={card.title} />
      {children}
      {card.body.map((b, i) => <Rich as="p" key={i} html={b} />)}
      <Rich className="spec" as="div" html={card.spec} />
    </article>
  );
}

const W = 400, H = 250, SX = 68, SY = 20, CX = 170, CY = 125;
const X = (x) => CX + x * SX;
const Y = (y) => CY - y * SY;
const f = (x) => Math.sqrt(Math.max(0, x ** 3 + 7));

function Curve({ label }) {
  const pathRef = useRef(null);
  const geo = useMemo(() => {
    const x0 = -Math.cbrt(7);
    const xMax = Math.cbrt(5.6 ** 2 - 7);
    // One continuous stroke: lower branch right→left, through (x0, 0), upper branch left→right.
    const xs = Array.from({ length: 121 }, (_, i) => x0 + (i / 120) ** 2 * (xMax - x0));
    const d =
      [...xs].reverse().map((x, i) => `${i ? "L" : "M"}${X(x).toFixed(1)} ${Y(-f(x)).toFixed(1)}`).join("") +
      xs.map((x) => `L${X(x).toFixed(1)} ${Y(f(x)).toFixed(1)}`).join("");
    // The chord through P and Q meets the curve at a third point; reflecting it over the x-axis gives P+Q.
    const P = [-1.8, f(-1.8)];
    const Q = [0.5, f(0.5)];
    const m = (Q[1] - P[1]) / (Q[0] - P[0]);
    const rx = m * m - P[0] - Q[0];
    const ry = m * (P[0] - rx) - P[1];
    const line = (x) => P[1] + m * (x - P[0]);
    return { d, P, Q, rx, ry, line };
  }, []);

  useEffect(() => {
    const cp = pathRef.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const L = cp.getTotalLength();
    cp.style.strokeDasharray = L;
    cp.style.strokeDashoffset = L;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          cp.style.transition = "stroke-dashoffset 2.4s cubic-bezier(.22,1,.36,1)";
          cp.style.strokeDashoffset = 0;
          io.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    io.observe(cp.ownerSVGElement);
    return () => io.disconnect();
  }, []);

  const { d, P, Q, rx, ry, line } = geo;
  return (
    <div className="curve-box" role="img" aria-label={label}>
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
        <defs>
          <linearGradient id="cg" x1="0" x2="1">
            <stop offset="0" stopColor="#f7931a" stopOpacity=".25" />
            <stop offset=".5" stopColor="#f7931a" />
            <stop offset="1" stopColor="#f7931a" stopOpacity=".25" />
          </linearGradient>
        </defs>
        <g stroke="rgba(255,255,255,0.07)">
          {Array.from({ length: 9 }, (_, i) => <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2={H} />)}
          {Array.from({ length: 6 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 50} x2={W} y2={i * 50} />)}
        </g>
        <line x1="0" y1={CY} x2={W} y2={CY} stroke="rgba(255,255,255,0.2)" />
        <line x1={CX} y1="0" x2={CX} y2={H} stroke="rgba(255,255,255,0.2)" />
        <path ref={pathRef} d={d} fill="none" stroke="url(#cg)" strokeWidth="2" />
        <line x1={X(P[0] - 0.3)} y1={Y(line(P[0] - 0.3))} x2={X(rx + 0.3)} y2={Y(line(rx + 0.3))} stroke="rgba(237,237,240,0.35)" strokeDasharray="4 4" />
        <circle cx={X(rx)} cy={Y(-ry)} r="3" fill="none" stroke="rgba(237,237,240,0.5)" />
        <line x1={X(rx)} y1={Y(-ry)} x2={X(rx)} y2={Y(ry)} stroke="rgba(237,237,240,0.25)" strokeDasharray="2 4" />
        <g fontFamily="var(--mono)" fontSize="11">
          <circle cx={X(P[0])} cy={Y(P[1])} r="4.5" fill="#ededf0" />
          <text x={X(P[0]) - 16} y={Y(P[1]) - 9} fill="#ededf0">P</text>
          <circle cx={X(Q[0])} cy={Y(Q[1])} r="4.5" fill="#ededf0" />
          <text x={X(Q[0]) - 18} y={Y(Q[1]) - 8} fill="#ededf0">Q</text>
          <circle cx={X(rx)} cy={Y(ry)} r="5" fill="#f7931a" />
          <text x={X(rx) + 10} y={Y(ry) + 4} fill="#f7931a">P+Q</text>
          <text x="12" y="20" fill="#9a9aa8">y² = x³ + 7</text>
        </g>
      </svg>
    </div>
  );
}

function Merkle({ label }) {
  const box = { fill: "#0c0c11", stroke: "rgba(255,255,255,0.18)" };
  const leaves = [["tx A", 30], ["tx B", 130], ["tx C", 210], ["tx D", 310]];
  return (
    <div className="merkle">
      <svg viewBox="0 0 400 210" role="img" aria-label={label}>
        <path
          d="M200 38 L110 92 M200 38 L290 92 M110 112 L60 166 M110 112 L160 166 M290 112 L240 166 M290 112 L340 166"
          stroke="rgba(255,255,255,0.18)"
          fill="none"
        />
        <g fontFamily="var(--mono)" fontSize="11" textAnchor="middle">
          <rect x="140" y="12" width="120" height="28" rx="6" fill="rgba(247,147,26,0.14)" stroke="#f7931a" />
          <text x="200" y="30" fill="#f7931a">Merkle root</text>
          <rect x="70" y="90" width="80" height="24" rx="6" {...box} />
          <text x="110" y="106" fill="#ededf0">H(AB)</text>
          <rect x="250" y="90" width="80" height="24" rx="6" {...box} />
          <text x="290" y="106" fill="#ededf0">H(CD)</text>
          {leaves.map(([name, x]) => (
            <g key={name}>
              <rect x={x} y="164" width="60" height="24" rx="6" {...box} />
              <text x={x + 30} y="180" fill="#9a9aa8">{name}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function Cryptography() {
  const { t } = useLanguage();
  const c = t.crypto;
  return (
    <section className="section section-tint" id="cryptography">
      <div className="wrap">
        <SectionHead as="h1" eyebrow={c.eyebrow} title={c.title} lede={c.lede} />
        <div className="crypto-grid">
          <Card span="span-7" card={c.cards.hash} />
          <Card span="span-5" card={c.cards.pow} />
          <Card span="span-6" card={c.cards.ecdsa}>
            <Curve label={c.curveAria} />
          </Card>
          <Card span="span-6" card={c.cards.merkle}>
            <Merkle label={c.merkleAria} />
          </Card>
          <Card span="span-4" card={c.cards.schnorr} />
          <Card span="span-4" card={c.cards.address} />
          <Card span="span-4" card={c.cards.wallet} />
        </div>
      </div>
    </section>
  );
}
