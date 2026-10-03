import { Icon } from "../components/Icon";
import { PlotPreview } from "../components/PlotPreview";
const boundary = [
  { longitude: 86.1, latitude: 25.9 },
  { longitude: 86.102, latitude: 25.9 },
  { longitude: 86.102, latitude: 25.902 },
  { longitude: 86.1, latitude: 25.902 },
  { longitude: 86.1, latitude: 25.9 },
];
export function ProductPreview() {
  return (
    <figure className="product-preview">
      <div className="preview-topline">
        <span>
          <Icon name="leaf" size={18} />
          FARM RECORD
        </span>
        <span className="preview-example">EXAMPLE</span>
      </div>
      <div className="preview-heading">
        <div>
          <p>Know what matters.</p>
          <h2>Start with the farm.</h2>
        </div>
        <span className="preview-crop">Paddy</span>
      </div>
      <div className="preview-plot">
        <PlotPreview points={boundary} name="an illustrative farm" />
        <dl>
          <div>
            <dt>Reported area</dt>
            <dd>
              1.25 <span>ha</span>
            </dd>
          </div>
          <div>
            <dt>Crop stage</dt>
            <dd>Growing</dd>
          </div>
          <div>
            <dt>Movable asset</dt>
            <dd>One pump</dd>
          </div>
        </dl>
      </div>
      <div className="preview-action">
        <span className="preview-action-icon">
          <Icon name="file" />
        </span>
        <div>
          <strong>A record you can keep</strong>
          <span>Crop, assets and a preparedness checklist.</span>
        </div>
        <Icon name="arrow" size={18} />
      </div>
      <figcaption>
        Illustrative record. The boundary is a schematic, not a surveyed or
        flood-risk map.
      </figcaption>
    </figure>
  );
}
