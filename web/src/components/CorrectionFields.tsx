import { boundaryText } from "../correction";
import type { Farm } from "../types";
export function CorrectionFields({
  farm,
  locked,
}: {
  farm: Farm;
  locked: boolean;
}) {
  return (
    <>
      <fieldset disabled={locked}>
        <legend>
          <span>01</span>Correct the farm details
        </legend>
        <div className="form-grid">
          <label>
            Crop
            <select name="crop" defaultValue={farm.crop}>
              <option>Paddy</option>
              <option>Maize</option>
              <option>Vegetables</option>
            </select>
          </label>
          <label>
            Crop stage
            <select name="stage" defaultValue={farm.stage}>
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
              defaultValue={farm.areaHectares}
            />
          </label>
          <label className="full-width">
            Movable assets (optional)
            <input name="assets" maxLength={500} defaultValue={farm.assets} />
          </label>
        </div>
        <label htmlFor="corrected-boundary">
          Longitude, latitude coordinates
        </label>
        <p className="field-hint" id="correction-boundary-help">
          One pair per line, 4 to 100 points. Repeat the first point at the end.
          This is a recorded boundary, not a surveyed map.
        </p>
        <textarea
          id="corrected-boundary"
          name="boundary"
          rows={5}
          required
          maxLength={5000}
          aria-describedby="correction-boundary-help"
          defaultValue={boundaryText(farm)}
        />
      </fieldset>
      <fieldset disabled={locked}>
        <legend>
          <span>02</span>Review before saving
        </legend>
        <label htmlFor="correction-reason">Reason for this correction</label>
        <p className="field-hint" id="reason-help">
          Describe what needed correction. Do not include unrelated personal or
          financial information.
        </p>
        <textarea
          id="correction-reason"
          name="reason"
          rows={3}
          required
          maxLength={300}
          aria-describedby="reason-help"
        />
        <label className="correction-review">
          <input type="checkbox" name="reviewed" required />
          <span>
            I have reviewed the corrected details. This does not change the
            farmer's identity or original permission.
          </span>
        </label>
      </fieldset>
    </>
  );
}
