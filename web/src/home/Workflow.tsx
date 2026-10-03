import { Icon } from "../components/Icon";
const steps = [
  {
    number: "01",
    icon: "farm",
    title: "Know the farm",
    text: "With permission, record the plot, crop stage and movable assets. A PIN code alone is not a farm boundary.",
  },
  {
    number: "02",
    icon: "check",
    title: "Make a practical plan",
    text: "Keep farm documents together, record equipment and agree who to contact. The current checklist is an example for review.",
  },
  {
    number: "03",
    icon: "file",
    title: "Keep a clear record",
    text: "Save completed actions and print a farm summary. Give the farmer a record they can read with a field worker.",
  },
] as const;
export function Workflow() {
  return (
    <section
      className="public-section workflow-section"
      id="how-it-works"
      tabIndex={-1}
      aria-labelledby="workflow-title"
    >
      <div className="public-section-heading">
        <div>
          <span className="eyebrow">FROM RECORD TO READINESS</span>
          <h2 id="workflow-title">
            Less guesswork.
            <br />A clearer next step.
          </h2>
        </div>
        <p>
          A useful service begins with the farm in front of you, not a generic
          warning on a screen.
        </p>
      </div>
      <ol className="workflow-steps">
        {steps.map((step) => (
          <li key={step.number}>
            <div className="workflow-step-top">
              <span>{step.number}</span>
              <Icon name={step.icon} size={28} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
