import { useEffect } from "react";
import { Icon } from "../components/Icon";
import { PublicHeader } from "./PublicHeader";
import { ProductPreview } from "./ProductPreview";
import { Workflow } from "./Workflow";
import { Audiences } from "./Audiences";
import { Principles } from "./Principles";
import { Questions } from "./Questions";
import "./homepage.css";
export function Homepage() {
  useEffect(() => {
    document.title = "TerraFort | Farm records. Practical preparedness.";
    document
      .querySelector('meta[name="robots"]')
      ?.setAttribute("content", "index,follow");
  }, []);
  return (
    <div className="public-home">
      <a className="skip-link" href="#home-content">
        Skip to content
      </a>
      <PublicHeader />
      <main id="home-content" tabIndex={-1}>
        <section
          className="public-hero public-section"
          aria-labelledby="home-title"
        >
          <div className="public-hero-copy">
            <span className="eyebrow">
              FARM RECORDS. PRACTICAL PREPAREDNESS.
            </span>
            <h1 id="home-title">
              Know your farm.
              <br />
              Prepare for
              <br />
              <em>what comes next.</em>
            </h1>
            <p>
              When heavy rain threatens a season's work, a warning alone is not
              enough. Start with a clear farm record and a practical plan.
            </p>
            <a
              className="button primary public-primary-cta"
              href="/workspace#overview"
            >
              Explore the field workspace
              <Icon name="arrow" />
            </a>
            <p className="hero-evaluation-note">
              Evaluation release · sample records only
            </p>
            <a className="public-inline-link" href="#how-it-works">
              See how the first workflow works<span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="public-hero-visual">
            <div className="preview-context">
              <span className="preview-context-dot" />A FARM RECORD, NOT ANOTHER
              FORECAST
            </div>
            <ProductPreview />
            <p className="visual-bottom-note">
              Protect before. Prove after. Recover faster.
            </p>
          </div>
        </section>
        <div className="public-purpose-strip">
          <div className="public-section">
            <span>BUILT AROUND THE FARMER</span>
            <p>
              Clear records <span aria-hidden="true">/</span> Practical actions{" "}
              <span aria-hidden="true">/</span> Trusted assistance
            </p>
          </div>
        </div>
        <Workflow />
        <Audiences />
        <Principles />
        <Questions />
        <section
          className="public-section closing-section"
          aria-labelledby="closing-title"
        >
          <div>
            <span className="eyebrow">THE FIRST STEP IS A CLEAR RECORD</span>
            <h2 id="closing-title">
              Start with what
              <br />
              the farmer can use.
            </h2>
            <p>
              Explore the current registry, checklist and farmer summary. Use
              sample information only.
            </p>
          </div>
          <a className="button primary" href="/workspace#overview">
            Explore the field workspace
            <Icon name="arrow" />
          </a>
        </section>
      </main>
      <footer className="public-footer">
        <div className="public-section">
          <div>
            <a href="/" className="brand" aria-label="TerraFort homepage">
              <Icon name="leaf" size={28} />
              TerraFort<span className="brand-dot">.</span>
            </a>
            <p>Protect before. Prove after. Recover faster.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#our-approach">Our approach</a>
            <a href="#questions">Common questions</a>
            <a href="/workspace#overview">Field workspace</a>
          </nav>
        </div>
        <div className="public-footer-note public-section">
          <p>
            Agricultural preparedness and recovery, one verified step at a time.
          </p>
          <p>TerraFort does not replace official emergency services.</p>
        </div>
      </footer>
    </div>
  );
}
