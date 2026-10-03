import type { Farm } from "../types";
import { Icon } from "../components/Icon";
import { FarmCard } from "../components/FarmCard";
import { navigate } from "../navigation";
export function Overview({ farms }: { farms: Farm[] }) {
  const area = farms.reduce((sum, farm) => sum + Number(farm.areaHectares), 0);
  const villages = new Set(
    farms.map((farm) => `${farm.district}/${farm.village}`),
  ).size;
  return (
    <>
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow light">FROM FARM RECORD TO READINESS</span>
          <h2>
            Good preparation
            <br />
            starts on the ground.
          </h2>
          <p>
            Bring your farm records together.
            <br />
            Make a plan before the weather changes.
          </p>
          <button
            className="button light-button"
            onClick={() => navigate("register")}
          >
            Register a farm
            <Icon name="arrow" />
          </button>
        </div>
        <div className="hero-aside">
          <span className="hero-number">
            01<span> / 03</span>
          </span>
          <div className="hero-step">
            <span className="step-dot" />
            Know your farm
          </div>
          <div className="hero-step muted-light">Prepare together</div>
          <div className="hero-step muted-light">Keep a clear record</div>
          <p>
            Protect before.
            <br />
            Prove after. Recover faster.
          </p>
        </div>
      </section>
      <section className="metrics" aria-label="Registry totals">
        <article>
          <span className="metric-label">
            Registered farms
            <Icon name="farm" />
          </span>
          <strong>{farms.length.toString().padStart(2, "0")}</strong>
          <span>Consented farm records</span>
        </article>
        <article>
          <span className="metric-label">
            Recorded land
            <Icon name="leaf" />
          </span>
          <strong>
            {area.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            <small> ha</small>
          </strong>
          <span>Farmer-reported area</span>
        </article>
        <article>
          <span className="metric-label">
            Villages represented
            <Icon name="pin" />
          </span>
          <strong>{villages.toString().padStart(2, "0")}</strong>
          <span>Within this workspace</span>
        </article>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE FARM REGISTRY</span>
          <h2>Your farms, at a glance</h2>
        </div>
        <a className="text-button" href="#farms">
          View all farms
          <Icon name="arrow" />
        </a>
      </div>
      {farms.length ? (
        <div className="farm-grid">
          {farms.slice(0, 3).map((farm) => (
            <FarmCard key={farm.id} farm={farm} />
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <Icon name="farm" size={40} />
          <h3>Your first farm starts here.</h3>
          <p>
            Register a farm with the farmer's permission. Its preparedness plan
            will be saved alongside the record.
          </p>
          <a className="text-button" href="#register">
            Start registration
            <Icon name="arrow" />
          </a>
        </section>
      )}
      <aside className="safety-note">
        <Icon name="help" />
        <p>
          <strong>A preparedness workspace, not an emergency service.</strong>{" "}
          No live flood forecast is connected. Follow official authorities and
          never enter floodwater.
        </p>
      </aside>
    </>
  );
}
