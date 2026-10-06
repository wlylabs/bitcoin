import Rich from "./Rich";

export default function SectionHead({ eyebrow, title, lede }) {
  return (
    <div className="section-head reveal">
      <span className="eyebrow">{eyebrow}</span>
      <Rich as="h2" html={title} />
      <p>{lede}</p>
    </div>
  );
}
