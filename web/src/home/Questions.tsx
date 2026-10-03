const questions = [
  {
    question: "Is TerraFort a live flood-warning service?",
    answer:
      "Not yet. The current release has farm registration, an illustrative preparedness checklist and a printable summary. Official weather and river data are not connected.",
  },
  {
    question: "Can I register a real farmer today?",
    answer:
      "The available workspace is for evaluation with sample records. An approved partner, reviewed local-language consent and operational safeguards are required before real farmer information is collected.",
  },
  {
    question: "Does a farm record confirm insurance cover?",
    answer:
      "No. The record does not confirm a policy, submit a claim or guarantee compensation. Insurance and recovery workflows require authorised partners.",
  },
  {
    question: "What is being built next?",
    answer:
      "The wider plan connects validated local warnings, approved actions, damage evidence and recovery support. Offline capture, identity and local-language content must be ready before a field pilot.",
  },
];
export function Questions() {
  return (
    <section
      className="public-section questions-section"
      id="questions"
      tabIndex={-1}
      aria-labelledby="questions-title"
    >
      <div>
        <span className="eyebrow">BEFORE YOU EXPLORE</span>
        <h2 id="questions-title">A few fair questions.</h2>
        <p className="muted">
          What this release does,
          <br />
          and what it does not.
        </p>
      </div>
      <div className="question-list">
        {questions.map((item) => (
          <details key={item.question}>
            <summary>
              {item.question}
              <span aria-hidden="true">+</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
