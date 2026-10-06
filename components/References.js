"use client";

import { useLanguage } from "./LanguageProvider";
import Rich from "./Rich";
import SectionHead from "./SectionHead";

const GITHUB = [
  ["bitcoin/bitcoin", "https://github.com/bitcoin/bitcoin"],
  ["bitcoin/bips", "https://github.com/bitcoin/bips"],
  ["bitcoin-core/secp256k1", "https://github.com/bitcoin-core/secp256k1"],
  ["bitcoinbook/bitcoinbook", "https://github.com/bitcoinbook/bitcoinbook"],
  ["lightning/bolts", "https://github.com/lightning/bolts"],
  ["mempool/mempool", "https://github.com/mempool/mempool"],
];
const DOCS = [
  ["Bitcoin Whitepaper", "https://bitcoin.org/bitcoin.pdf"],
  ["Satoshi Nakamoto Institute", "https://nakamotoinstitute.org/"],
  ["Bitcoin Developer Docs", "https://developer.bitcoin.org/"],
  ["Learn Me A Bitcoin", "https://learnmeabitcoin.com/"],
  ["NIST FIPS 180-4", "https://csrc.nist.gov/pubs/fips/180-4/upd1/final"],
  ["SEC 2: Recommended Elliptic Curve Domain Parameters", "https://www.secg.org/sec2-v2.pdf"],
];

function RefList({ heading, links, descriptions }) {
  return (
    <div className="reveal">
      <Rich as="h3" html={heading} />
      <ul className="ref-list">
        {links.map(([name, href], i) => (
          <li key={href}>
            <a href={href} target="_blank" rel="noopener noreferrer">
              <strong>{name}</strong>
              <b className="arrow">↗</b>
              <Rich html={descriptions[i]} />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function References() {
  const { t } = useLanguage();
  const r = t.refs;
  return (
    <section className="section section-ruled" id="references">
      <div className="wrap">
        <SectionHead eyebrow={r.eyebrow} title={r.title} lede={r.lede} />
        <div className="refs">
          <RefList heading={r.github} links={GITHUB} descriptions={r.githubItems} />
          <RefList heading={r.docs} links={DOCS} descriptions={r.docItems} />
        </div>
      </div>
    </section>
  );
}
