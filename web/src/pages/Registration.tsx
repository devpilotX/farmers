import { useRegistration } from "../hooks/useRegistration";
import { Icon } from "../components/Icon";
import type { Farm } from "../types";
const consentText =
  "I give permission to record my name, village, crop, assets and plot boundary for assisted farm registration and preparedness. This does not permit sharing with an insurer or bank. I understand this local demo must contain sample data only.";
export function Registration({
  onSaved,
  onQueued,
  localCapture,
}: {
  onSaved: (farm: Farm) => void;
  onQueued: () => void;
  localCapture: boolean;
}) {
  const {
    formRef,
    error,
    notice,
    saving,
    dirty,
    queued,
    loading,
    setDirty,
    submit,
  } = useRegistration(localCapture, onSaved, onQueued);
  const locked = saving || queued || loading;
  return (
    <form
      ref={formRef}
      className="panel registration"
      onSubmit={submit}
      onChange={() => setDirty(true)}
    >
      <div className="section-heading">
        <div>
          <span className="eyebrow">START WITH THE FARMER</span>
          <h2>Register a farm</h2>
          <p className="muted">
            All fields except assets are required. Use sample information only.
          </p>
        </div>
        <span className="tag neutral">
          {queued
            ? "Pending confirmation"
            : dirty
              ? "Unsaved entries"
              : "New record"}
        </span>
      </div>
      {localCapture && (
        <div className="capture-note">
          <strong>Sample capture on this device</strong>
          <p>
            One sample draft is kept in this browser. Saving it again replaces
            the reviewed copy. A submitted sample is kept pending until the API
            confirms it. Copies expire after seven days; this is not an
            encrypted backup. Never enter real farmer information.
          </p>
        </div>
      )}
      {loading && <p role="status">Checking saved device entries...</p>}
      {notice && (
        <p className="success-notice" role="status">
          {notice}
        </p>
      )}
      <fieldset disabled={locked}>
        <legend>
          <span>01</span>Farmer and location
        </legend>
        <div className="form-grid">
          <label>
            Farmer name
            <input
              name="farmerName"
              autoComplete="off"
              required
              maxLength={100}
            />
          </label>
          <label>
            Village
            <input name="village" required maxLength={100} />
          </label>
          <label>
            District
            <input name="district" required maxLength={100} />
          </label>
        </div>
      </fieldset>
      <fieldset disabled={locked}>
        <legend>
          <span>02</span>Crop and assets
        </legend>
        <div className="form-grid">
          <label>
            Crop
            <select name="crop">
              <option>Paddy</option>
              <option>Maize</option>
              <option>Vegetables</option>
            </select>
          </label>
          <label>
            Crop stage
            <select name="stage">
              <option>Sowing</option>
              <option>Growing</option>
              <option>Ready to harvest</option>
            </select>
          </label>
          <label>
            Area in hectares
            <input
              name="areaHectares"
              type="number"
              required
              min="0.01"
              max="10000"
              step="0.01"
            />
          </label>
          <label className="full-width">
            Movable assets (optional)
            <input
              name="assets"
              placeholder="For example: one pump, stored seed"
              maxLength={500}
            />
          </label>
        </div>
      </fieldset>
      <fieldset disabled={locked}>
        <legend>
          <span>03</span>Recorded plot boundary
        </legend>
        <label htmlFor="boundary">Longitude, latitude coordinates</label>
        <p className="field-hint" id="boundary-help">
          One pair per line, 4 to 100 points. Repeat the first point at the end.
          Use agent-recorded coordinates, not a PIN code. A surveyed map is not
          provided by this form.
        </p>
        <textarea
          id="boundary"
          name="boundary"
          rows={5}
          required
          maxLength={5000}
          aria-describedby="boundary-help"
          placeholder={
            "86.100, 25.900\n86.102, 25.900\n86.102, 25.902\n86.100, 25.900"
          }
        />
      </fieldset>
      <fieldset className="consent" disabled={locked}>
        <legend>
          <span>04</span>Permission comes first
        </legend>
        <label>
          <input type="checkbox" name="consent" required />
          <span>{consentText}</span>
        </label>
        <p className="field-hint">
          Consent version: registry-v1-en. Read this aloud with the farmer
          before collecting real information in an approved deployment.
        </p>
      </fieldset>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {queued && (
        <p className="capture-note">
          This submitted copy is fixed to prevent duplicate registration.{" "}
          <a href="#pending">Open pending registrations</a> to retry or discard
          its device copy.
        </p>
      )}
      <div className="form-footer">
        <a
          className="text-button"
          href="#farms"
          onClick={(event) => {
            if (
              dirty &&
              !window.confirm(
                "Leave registration? Unsaved entries will be lost.",
              )
            )
              event.preventDefault();
          }}
        >
          Cancel
        </a>
        <button className="button primary" type="submit" disabled={locked}>
          {saving ? "Saving farm..." : "Save farm record"}
          <Icon name="arrow" />
        </button>
      </div>
      {localCapture && (
        <div className="capture-actions">
          <button
            type="submit"
            data-action="draft"
            formNoValidate
            className="button secondary"
            disabled={locked}
          >
            Save sample draft
          </button>
          <button
            type="submit"
            data-action="queue"
            className="button secondary"
            disabled={locked}
          >
            Keep pending for later
          </button>
          <button
            type="submit"
            data-action="discard-draft"
            formNoValidate
            className="text-button"
            disabled={locked}
          >
            Discard saved draft
          </button>
        </div>
      )}
    </form>
  );
}
