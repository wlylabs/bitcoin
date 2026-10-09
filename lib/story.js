// Satoshi's Wallet: a choose-your-path run through Bitcoin's history. This file holds
// the rules (prices, effects); the words live in lib/content.js under `play`.
//
// Prices are Coin Metrics daily closes for each date, except where noted.
import { eraOf } from "./history";

// Who you start as. `btc` and `invested` are your holdings and what they cost you.
export const PERSONAS = [
  { id: "miner", from: "mine", btc: 0, invested: 0 },
  // 5,000 BTC bought on the forum for about $20, a week before Pizza Day.
  { id: "early", from: "pizza", btc: 5000, invested: 20 },
  { id: "trader", from: "exchange", cash: 10000 },
  { id: "newcomer", from: "mania", cash: 10000 },
];

const sell = (s, part, price) => ({ ...s, btc: s.btc * (1 - part), cash: s.cash + s.btc * part * price, sold: true });
const buy = (s, usd, price) => ({ ...s, btc: s.btc + usd / price, invested: s.invested + usd });
const lose = (s) => ({ ...s, btc: 0, lost: s.lost + s.btc });

// Each node: `variant(state)` picks the copy and choices to show; each choice is
// [id, effect]. Choices can be limited to a variant with an object keyed by variant.
export const NODES = [
  {
    id: "mine",
    ym: "2009-01",
    price: null,
    choices: [
      ["month", (s) => ({ ...s, btc: s.btc + 1000, startBtc: 1000 })],
      ["once", (s) => ({ ...s, btc: s.btc + 50, startBtc: 50 })],
    ],
  },
  {
    id: "pizza",
    ym: "2010-05",
    price: 0.0041, // 10,000 BTC for about $41 of pizza
    choices: [
      ["spend", (s) => ({ ...s, btc: s.btc * 0.9, flags: { ...s.flags, pizza: true } })],
      ["keep", (s) => s],
    ],
  },
  {
    id: "parity",
    ym: "2011-02",
    price: 1.02,
    choices: [
      ["sellHalf", (s, p) => sell(s, 0.5, p)],
      ["hold", (s) => s],
    ],
  },
  {
    id: "backup",
    ym: "2012-06",
    price: 6.52,
    choices: [
      ["backup", (s) => ({ ...s, backup: true })],
      ["later", (s) => ({ ...s, backup: false })],
    ],
  },
  {
    id: "exchange",
    ym: "2013-04",
    price: 161.2,
    choices: [
      ["gox", (s) => ({ ...s, custody: "exchange" })],
      ["self", (s) => ({ ...s, custody: "self" })],
    ],
  },
  {
    id: "laptop",
    ym: "2013-11",
    price: 1129,
    // Without a backup, a dead laptop decides everything.
    variant: (s) => (s.custody === "self" && !s.backup && s.btc > 0 ? "risk" : "safe"),
    choices: {
      risk: [
        ["trash", (s) => ({ ...lose(s), flags: { ...s.flags, trashed: true } })],
        ["search", (s) => ({ ...s, backup: true })],
      ],
      safe: [
        ["sellHalf", (s, p) => sell(s, 0.5, p)],
        ["hold", (s) => s],
      ],
    },
  },
  {
    id: "gox",
    ym: "2014-02",
    price: 551,
    variant: (s) => (s.custody === "exchange" && s.btc > 0 ? "hit" : "safe"),
    // Mt. Gox halts withdrawals and files for bankruptcy; coins held there are gone.
    enter: (s, v) => (v === "hit" ? { ...lose(s), flags: { ...s.flags, gox: true } } : s),
    choices: [
      ["self", (s) => ({ ...s, custody: "self" })],
      ["another", (s) => ({ ...s, custody: "exchange" })],
    ],
  },
  {
    id: "fork",
    ym: "2017-08",
    price: 2690,
    // On 2 August 2017 one BCH traded for about 0.127 BTC.
    variant: (s) => (s.btc > 0 ? "has" : "none"),
    choices: {
      has: [
        ["swap", (s) => ({ ...s, btc: s.btc * 1.127, flags: { ...s.flags, bch: true } })],
        ["ignore", (s) => s],
      ],
      none: [["continue", (s) => s]],
    },
  },
  {
    id: "mania",
    ym: "2017-12",
    price: 19250,
    choices: [
      ["sellHalf", (s, p) => sell(s, 0.5, p)],
      ["hold", (s) => s],
      // 3× leverage: borrow twice your stack. A one-third drop wipes you out.
      ["leverage", (s) => ({ ...s, flags: { ...s.flags, leveraged: true } })],
    ],
  },
  {
    id: "winter",
    ym: "2018-12",
    price: 3185,
    variant: (s) => (s.flags.leveraged && s.btc > 0 ? "liquidated" : "normal"),
    enter: (s, v) => (v === "liquidated" ? { ...lose(s), flags: { ...s.flags, leveraged: false, liquidated: true } } : s),
    choices: [
      ["sellAll", (s, p) => sell(s, 1, p)],
      ["hold", (s) => s],
      ["buy", (s, p) => buy(s, 1000, p)],
    ],
  },
  {
    id: "covid",
    ym: "2020-03",
    price: 4959,
    choices: [
      ["sellAll", (s, p) => sell(s, 1, p)],
      ["hold", (s) => s],
      ["buy", (s, p) => buy(s, 1000, p)],
    ],
  },
  {
    id: "yield",
    ym: "2021-11",
    price: 67540,
    choices: [
      ["deposit", (s) => ({ ...s, custody: "lender" })],
      ["keep", (s) => s],
    ],
  },
  {
    id: "ftx",
    ym: "2022-11",
    price: 16920,
    variant: (s) => (s.custody === "lender" && s.btc > 0 ? "hit" : "safe"),
    // Bankrupt lenders and exchanges value claims in dollars at the filing date,
    // so the coins come back years later as cash at the bottom of the market.
    enter: (s, v, p) => (v === "hit" ? { ...s, btc: 0, cash: s.cash + s.btc * p, frozen: s.btc, flags: { ...s.flags, lender: true } } : s),
    choices: [
      ["self", (s) => ({ ...s, custody: "self" })],
      ["exchange", (s) => ({ ...s, custody: s.custody === "lender" ? "exchange" : s.custody })],
    ],
  },
  {
    id: "etf",
    ym: "2024-01",
    price: 46380,
    variant: (s) => (s.btc > 0 ? "has" : "none"),
    choices: {
      has: [
        ["etf", (s) => ({ ...s, custody: "etf" })],
        ["keys", (s) => s],
      ],
      none: [
        ["buy", (s, p) => buy(s, 1000, p)],
        ["skip", (s) => s],
      ],
    },
  },
];

export const NODE_INDEX = Object.fromEntries(NODES.map((n, i) => [n.id, i]));
export const nodeSkin = (node) => eraOf(node.ym).skin;

export function startState(personaId) {
  const p = PERSONAS.find((x) => x.id === personaId);
  const node = NODES[NODE_INDEX[p.from]];
  let s = { persona: p.id, btc: p.btc ?? 0, cash: 0, invested: p.invested ?? 0, custody: "self", backup: false, lost: 0, frozen: 0, sold: false, flags: {}, startBtc: p.btc ?? 0, log: [] };
  // Cash personas buy at the first node's price and leave the coins on the exchange they bought from.
  if (p.cash) s = { ...buy(s, p.cash, node.price), custody: "exchange", startBtc: p.cash / node.price };
  return { step: NODE_INDEX[p.from], state: s };
}

export function variantOf(node, s) {
  return node.variant ? node.variant(s) : "default";
}

export function choicesOf(node, variant) {
  return Array.isArray(node.choices) ? node.choices : node.choices[variant];
}

// Arriving at a node: pick the variant from the state you arrive with, then apply
// the node's own event (a hack, a liquidation). The variant is kept for the choice.
export function arrive(node, s) {
  const variant = variantOf(node, s);
  return { variant, state: node.enter ? node.enter(s, variant, node.price) : s };
}

export function choose(node, s, variant, choiceId) {
  const [, effect] = choicesOf(node, variant).find(([id]) => id === choiceId);
  const next = effect(s, node.price);
  return { ...next, log: [...s.log, [node.id, variant, choiceId, next.btc]] };
}

// Lessons earned, in display order.
export function badgesOf(s) {
  const f = s.flags;
  const b = [];
  if (!s.sold && s.btc > 0 && !s.lost) b.push("diamond");
  if (f.pizza) b.push("pizza");
  if (s.backup && !f.trashed) b.push("backup");
  if (s.custody === "self" && !s.lost && !s.frozen) b.push("keys");
  if (s.custody === "etf") b.push("etf");
  if (f.bch) b.push("fork");
  if (f.trashed) b.push("trashed");
  if (f.gox) b.push("gox");
  if (f.liquidated) b.push("liquidated");
  if (f.lender) b.push("lender");
  return b;
}
