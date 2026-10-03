import type { Farm } from "../types";
import { Icon } from "./Icon";
import { navigate } from "../navigation";
export function FarmCard({ farm }: { farm: Farm }) {
  return (
    <article className="farm-card">
      <div className="farm-card-top">
        <span className="crop-icon">
          <Icon name="leaf" size={28} />
        </span>
        <span className="tag neutral">{farm.crop}</span>
      </div>
      <h3>{farm.farmerName}</h3>
      <p>
        <Icon name="pin" size={16} />
        {farm.village}, {farm.district}
      </p>
      <dl className="farm-facts">
        <div>
          <dt>Recorded area</dt>
          <dd>{farm.areaHectares} ha</dd>
        </div>
        <div>
          <dt>Crop stage</dt>
          <dd>{farm.stage}</dd>
        </div>
      </dl>
      <button
        className="text-button"
        onClick={() => navigate("summary", farm.id)}
      >
        View farm record
        <Icon name="arrow" size={18} />
      </button>
    </article>
  );
}
