import type { Farm } from "../types";
import { CorrectionFields } from "../components/CorrectionFields";
import { useCorrection } from "../hooks/useCorrection";
import { navigate } from "../navigation";
export function Correction({
  farm,
  onSaved,
  onRefresh,
}: {
  farm: Farm;
  onSaved: (farm: Farm) => void;
  onRefresh: () => void;
}) {
  const state = useCorrection(farm, onSaved);
  const currentVersion = Number.isInteger(farm.version) && farm.version > 0;
  if (!currentVersion)
    return (
      <section className="panel">
        <h2>Open a current record first</h2>
        <p>
          Record versions are unavailable. Refresh the workspace before making a
          correction.
        </p>
        <button className="button secondary" onClick={onRefresh}>
          Refresh workspace
        </button>
      </section>
    );
  const locked = state.saving || !!state.attempt;
  return (
    <form
      className="panel registration"
      onSubmit={state.submit}
      onChange={() => {
        state.markDirty();
      }}
      aria-busy={state.saving}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">REVIEWED CORRECTION</span>
          <h2>Keep this farm record accurate</h2>
          <p className="muted">
            {farm.farmerName} · {farm.village} · {farm.district}
          </p>
        </div>
        <span className="tag neutral">Version {farm.version}</span>
      </div>
      <div className="capture-note">
        <strong>The same farm, a clearer record</strong>
        <p>
          Identity, original permission and saved actions stay unchanged. Only
          corrected field names and your reason appear in history. This form is
          not saved on this device and cannot be queued offline.
        </p>
      </div>
      <CorrectionFields farm={farm} locked={locked} />
      {state.error && (
        <div className="error-box" role="alert">
          <p>{state.error}</p>
          {state.attempt && !state.conflict && (
            <p>
              The response is unconfirmed. Keep this page open and retry this
              exact submission. Check history before starting a different
              correction.
            </p>
          )}
        </div>
      )}
      {state.attempt && !state.conflict && (
        <p className="capture-note">
          This submission is fixed for a safe retry. Its request reference is{" "}
          <span className="record-reference">{state.attempt.requestId}</span>.
        </p>
      )}
      <div className="form-footer">
        <a className="text-button" href={`#summary?farm=${farm.id}`}>
          Return to farm summary
        </a>
        {state.conflict ? (
          <button
            type="button"
            className="button primary"
            onClick={() => {
              state.markClean();
              onRefresh();
              navigate("summary", farm.id);
            }}
          >
            Review current record
          </button>
        ) : state.attempt ? (
          <button
            type="button"
            className="button primary"
            disabled={state.saving}
            onClick={state.retry}
          >
            {state.saving
              ? "Confirming correction..."
              : "Retry this correction"}
          </button>
        ) : (
          <button type="submit" className="button primary">
            Save reviewed correction
          </button>
        )}
      </div>
    </form>
  );
}
