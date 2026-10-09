import BitcoinLogo from "./BitcoinLogo";

// A window dressed in the software look of an era. The chrome is decorative
// (aria-hidden); the body carries the real content.
//   classic  - Windows 2000/XP classic, like Bitcoin v0.1 (2009)
//   forum    - an SMF message board, like the early BitcoinTalk (2010–2013)
//   exchange - a dark trading terminal (2014–2017)
//   mobile   - a phone wallet app (2017–2020)
//   modern   - today's dark web UI (2021–now)
export default function EraWindow({ skin, title, nav, status, className = "", children, ...rest }) {
  return (
    <div className={`ew ew-${skin} ${className}`} {...rest}>
      <div className="ew-bar" aria-hidden="true">
        {skin === "mobile" && (
          <div className="ew-phone-status">
            <span>9:41</span>
            <span className="ew-phone-icons">
              <i />
              <i />
              <i />
            </span>
          </div>
        )}
        <div className="ew-title">
          {skin === "exchange" ? <span className="ew-live" /> : <BitcoinLogo size={skin === "mobile" ? 18 : 14} />}
          <span>{title}</span>
          {skin === "classic" && (
            <span className="ew-caps">
              <i>_</i>
              <i>□</i>
              <i>×</i>
            </span>
          )}
          {skin === "modern" && <span className="ew-dots"><i /><i /><i /></span>}
        </div>
        {skin === "forum" && nav && (
          <div className="ew-forum-nav">
            {nav.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>
        )}
      </div>
      <div className="ew-body">{children}</div>
      {status && <div className="ew-status">{status}</div>}
    </div>
  );
}
