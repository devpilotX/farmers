import type { Farm, Task } from "../types";
import { PlotPreview } from "../components/PlotPreview";
import { Icon } from "../components/Icon";
import { navigate } from "../navigation";
export function Summary({
  farm,
  tasks,
}: {
  farm: Farm;
  tasks: Task[] | undefined;
}) {
  return (
    <section className="panel summary">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FARMER COPY</span>
          <h2>{farm.farmerName}'s farm</h2>
          <p className="muted">
            {farm.village} · {farm.district}
          </p>
        </div>
        <button
          className="button secondary no-print"
          onClick={() => window.print()}
        >
          <Icon name="file" />
          Print summary
        </button>
      </div>
      <div className="summary-grid">
        <PlotPreview points={farm.boundary} name={farm.farmerName} />
        <div>
          <span className="tag neutral">{farm.crop}</span>
          <dl className="summary-facts">
            <div>
              <dt>Crop stage</dt>
              <dd>{farm.stage}</dd>
            </div>
            <div>
              <dt>Farmer-reported area</dt>
              <dd>{farm.areaHectares} hectares</dd>
            </div>
            <div>
              <dt>Recorded assets</dt>
              <dd>{farm.assets || "No assets recorded"}</dd>
            </div>
            <div>
              <dt>Registration date</dt>
              <dd>{new Date(farm.createdAt).toLocaleDateString("en-IN")}</dd>
            </div>
            <div>
              <dt>Record reference</dt>
              <dd className="record-reference">{farm.id}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="summary-bottom">
        <div>
          <h3>Preparedness record</h3>
          <p>
            {tasks
              ? `${tasks.filter((task) => task.completed).length} of ${tasks.length} actions recorded as complete.`
              : "Preparedness data is unavailable. Retry the actions above."}
          </p>
          <button
            className="text-button no-print"
            onClick={() => navigate("prepare", farm.id)}
          >
            Open the checklist
            <Icon name="arrow" />
          </button>
        </div>
        <div>
          <h3>Permission to keep this record</h3>
          <p>
            Consent recorded on{" "}
            {new Date(farm.consentAt).toLocaleDateString("en-IN")}. Purpose:
            assisted farm registration and preparedness. Version:{" "}
            {farm.consentVersion}.
          </p>
        </div>
      </div>
      <p className="plan-disclaimer">
        This record does not confirm insurance cover, predict flood damage or
        guarantee assistance. The boundary is a schematic, not a surveyed or
        cadastral map. Checklist content is illustrative and not approved for
        field use.
      </p>
    </section>
  );
}
