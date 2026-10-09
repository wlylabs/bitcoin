"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { eraOf, formatMonth, formatUsd, LAST_MONTH, LATEST, usdIdr } from "@/lib/history";
import { arrive, badgesOf, choicesOf, choose, NODE_INDEX, NODES, PERSONAS, startState } from "@/lib/story";
import { useBtcPrice } from "@/lib/useLiveBitcoin";
import EraWindow from "./EraWindow";
import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

const STORE = "satoshi-wallet-v1";
const BAD = new Set(["trashed", "gox", "liquidated", "lender"]);

function load() {
  try {
    const g = JSON.parse(localStorage.getItem(STORE));
    return g && NODES[g.step] && g.state ? g : null;
  } catch {
    return null;
  }
}
function save(game) {
  try {
    if (game) localStorage.setItem(STORE, JSON.stringify(game));
    else localStorage.removeItem(STORE);
  } catch {
    // Private mode or blocked storage: the game still works, it just won't resume.
  }
}

const fmtBtc = (n, loc) => n.toLocaleString(loc, { minimumFractionDigits: n > 0 && n < 1 ? 4 : 2, maximumFractionDigits: n > 0 && n < 1 ? 4 : 2 });
const usd = (v, loc) => new Intl.NumberFormat(loc, { style: "currency", currency: "USD", maximumFractionDigits: v < 100 ? 2 : 0 }).format(v);
const idr = (v, loc) => new Intl.NumberFormat(loc, { style: "currency", currency: "IDR", notation: v >= 1e9 ? "compact" : "standard", maximumFractionDigits: v >= 1e9 ? 2 : 0 }).format(v);

function Picker({ p, saved, onPick, onResume }) {
  return (
    <div className="sw-pick">
      {saved && (
        <div className="sw-resume reveal">
          <button type="button" className="btn" onClick={onResume}>{p.resume} <b aria-hidden="true">→</b></button>
        </div>
      )}
      <h2 className="sw-pick-title">{p.pick}</h2>
      <div className="sw-personas">
        {PERSONAS.map((persona) => {
          const [name, when, text] = p.personas[persona.id];
          const skin = eraOf(NODES[NODE_INDEX[persona.from]].ym).skin;
          return (
            <button key={persona.id} type="button" className={`sw-persona skin-${skin}`} onClick={() => onPick(persona.id)}>
              <span className="sw-when">{when}</span>
              <b>{name}</b>
              <span>{text}</span>
              <span className="sw-go" aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Hud({ p, s, price, ym, loc }) {
  const then = price === null ? null : s.btc * price + s.cash;
  return (
    <dl className="sw-hud" aria-label={p.holdings}>
      <div>
        <dt>{p.btc}</dt>
        <dd>₿ {fmtBtc(s.btc, loc)}</dd>
      </div>
      <div>
        <dt>{p.cash}</dt>
        <dd>{usd(s.cash, loc)}</dd>
      </div>
      <div>
        <dt>{p.value}</dt>
        <dd>
          {then === null ? p.noPrice : usd(then, loc)}
          {then !== null && <small>{idr(then * usdIdr(ym), loc)}</small>}
        </dd>
      </div>
      <div>
        <dt>{p.where}</dt>
        <dd>{p.custody[s.custody]}</dd>
      </div>
    </dl>
  );
}

function Card({ p, game, onChoose, lang, loc, title, nav }) {
  const node = NODES[game.step];
  const copy = p.nodes[node.id];
  const [date, head] = copy.head;
  const text = copy[game.variant];
  const heading = useRef(null);
  const first = NODE_INDEX[PERSONAS.find((x) => x.id === game.state.persona).from];

  // Move focus to each new moment so keyboard and screen-reader users follow along.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.closest(".sw-play")?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [game.step]);

  return (
    <div className="sw-play">
      <div className="sw-progress">
        <span>{p.step(game.step - first + 1, NODES.length - first)}</span>
        <div className="sw-bar" aria-hidden="true">
          <i style={{ width: `${((game.step - first + 1) / (NODES.length - first)) * 100}%` }} />
        </div>
      </div>
      <Hud p={p} s={game.state} price={node.price} ym={node.ym} loc={loc} />
      <EraWindow skin={eraOf(node.ym).skin} title={title} nav={nav} className="sw-card" key={node.id}>
        <span className="sw-date">{date}</span>
        <h3 ref={heading} tabIndex={-1}>{head}</h3>
        <Rich as="p" html={text} />
        {node.price !== null && <span className="sw-price">₿ = {formatUsd(node.price, loc)}</span>}
        <div className="sw-choices">
          {choicesOf(node, game.variant).map(([id]) => (
            <button key={id} type="button" className="demo-btn sw-choice" onClick={() => onChoose(id)}>
              {copy.choices[id]}
            </button>
          ))}
        </div>
      </EraWindow>
      <Link className="sw-context" href={`/${lang}/history?y=${node.ym.slice(0, 4)}`}>
        {p.context} <b aria-hidden="true">↗</b>
      </Link>
    </div>
  );
}

function Result({ p, s, lang, loc, onAgain, onOther }) {
  const live = useBtcPrice();
  const r = p.result;
  const price = live?.usd ?? LATEST.price;
  const rate = live?.idr && live?.usd ? live.idr / live.usd : usdIdr(LAST_MONTH);
  const worth = s.btc * price + s.cash;
  const hodl = s.startBtc * price;
  const badges = badgesOf(s);
  const heading = useRef(null);
  useEffect(() => heading.current?.focus(), []);

  return (
    <div className="sw-result">
      <span className="eyebrow">{r.eyebrow}</span>
      <h2 ref={heading} tabIndex={-1}>{r.title}</h2>
      <div className="sw-worth">
        <span>{r.worth}</span>
        <b>{usd(worth, loc)}</b>
        <small>{idr(worth * rate, loc)}</small>
        <em>{live ? r.priceLive(usd(price, loc)) : r.priceData(usd(price, loc), formatMonth(LAST_MONTH, loc))}</em>
      </div>
      <dl className="stats-row sw-compare">
        <div>
          <dt>{r.hodl}</dt>
          <dd>{usd(hodl, loc)}</dd>
        </div>
        <div>
          <dt>{r.invested}</dt>
          <dd>{usd(s.invested, loc)}</dd>
        </div>
        <div>
          <dt>{r.lost}</dt>
          <dd>₿ {fmtBtc(s.lost, loc)}</dd>
        </div>
      </dl>

      {badges.length > 0 && (
        <>
          <h3 className="sw-sub">{r.badges}</h3>
          <ul className="sw-badges">
            {badges.map((b) => (
              <li key={b} className={BAD.has(b) ? "bad" : undefined}>
                <b>{p.badges[b][0]}</b>
                <span>{p.badges[b][1]}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h3 className="sw-sub">{r.journey}</h3>
      <ol className="sw-journey">
        {s.log.map(([nodeId, , choiceId, btcAfter]) => {
          const n = p.nodes[nodeId];
          return (
            <li key={nodeId}>
              <span className="sw-when">{n.head[0]}</span>
              <span>{n.choices[choiceId]}</span>
              <span className="mono">₿ {fmtBtc(btcAfter, loc)}</span>
            </li>
          );
        })}
      </ol>

      <div className="cta-row">
        <button type="button" className="btn" onClick={onAgain}>{r.again}</button>
        <button type="button" className="btn ghost" onClick={onOther}>{r.other}</button>
        <Link className="btn ghost" href={`/${lang}/history`}>{r.toTimeMachine}</Link>
      </div>
    </div>
  );
}

export default function SatoshiWallet() {
  const { lang, t } = useLanguage();
  const p = t.play;
  const loc = t.locale;
  const [game, setGame] = useState(null); // { step, variant, state, done? }
  const [saved, setSaved] = useState(null);

  useEffect(() => setSaved(load()), []);

  const update = (g) => {
    setGame(g);
    save(g && !g.done ? g : null);
  };

  const begin = (personaId) => {
    const { step, state } = startState(personaId);
    update({ step, ...arrive(NODES[step], state) });
  };

  const onChoose = (choiceId) => {
    const node = NODES[game.step];
    const next = choose(node, game.state, game.variant, choiceId);
    const step = game.step + 1;
    if (step >= NODES.length) update({ step: game.step, variant: game.variant, state: next, done: true });
    else update({ step, ...arrive(NODES[step], next) });
  };

  const node = game && NODES[game.step];
  const skin = node ? eraOf(node.ym).skin : null;

  return (
    <section className="section sw" id="play">
      <div className="wrap">
        <SectionHead as="h1" eyebrow={p.eyebrow} title={p.title} lede={p.lede} />
        {!game && <Picker p={p} saved={saved} onPick={begin} onResume={() => setGame(saved)} />}
        {game && !game.done && (
          <>
            <Card p={p} game={game} onChoose={onChoose} lang={lang} loc={loc} title={t.tm.console.titles[skin]} nav={t.tm.console.forumNav} />
            <div className="sw-restart">
              <button type="button" className="btn ghost" onClick={() => { update(null); setSaved(null); }}>{p.restart}</button>
            </div>
          </>
        )}
        {game?.done && (
          <Result
            p={p}
            s={game.state}
            lang={lang}
            loc={loc}
            onAgain={() => begin(game.state.persona)}
            onOther={() => {
              setGame(null);
              setSaved(null);
            }}
          />
        )}
      </div>
    </section>
  );
}
