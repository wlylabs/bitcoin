import Rich from "./Rich";

// The first section on a page passes as="h1" so each page has exactly one h1.
export default function SectionHead({ eyebrow, title, lede, as = "h2" }) {
  return (
    <div className="section-head reveal">
      <span className="eyebrow">{eyebrow}</span>
      <Rich as={as} html={title} />
      <p>{lede}</p>
    </div>
  );
}
