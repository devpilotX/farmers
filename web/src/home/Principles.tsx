import { Icon } from "../components/Icon";
const principles = [
  {
    icon: "check",
    title: "Permission before collection",
    text: "The registry requires consent. Permission to keep a farm record is not permission to share it with a bank or insurer.",
  },
  {
    icon: "help",
    title: "Clear limits, no false certainty",
    text: "Software cannot stop a flood or guarantee a payout. Official authorities take priority during an emergency.",
  },
  {
    icon: "file",
    title: "A record, not an empty promise",
    text: "The current workflow saves farm details and completed actions. Live alerts and recovery hand-offs are still planned.",
  },
] as const;
export function Principles() {
  return (
    <section
      className="principles-section"
      id="our-approach"
      tabIndex={-1}
      aria-labelledby="principles-title"
    >
      <div className="public-section">
        <div className="public-section-heading">
          <div>
            <span className="eyebrow">TRUST IS PART OF THE WORK</span>
            <h2 id="principles-title">
              Useful. Understandable.
              <br />
              Honest about its limits.
            </h2>
          </div>
          <p>
            Farm records are sensitive. Product claims matter. Both deserve care
            from the first step.
          </p>
        </div>
        <div className="principle-grid">
          {principles.map((principle) => (
            <article key={principle.title}>
              <Icon name={principle.icon} size={28} />
              <h3>{principle.title}</h3>
              <p>{principle.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
