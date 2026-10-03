import type { Farm } from "../types";
import { currentRoute, navigate } from "../navigation";
export function FarmSelection({
  farms,
  selected,
}: {
  farms: Farm[];
  selected: string;
}) {
  return (
    <div className="farm-selection no-print">
      <label htmlFor="selected-farm">Selected farm</label>
      <select
        id="selected-farm"
        value={selected}
        onChange={(event) => navigate(currentRoute(), event.target.value)}
      >
        {farms.map((farm) => (
          <option value={farm.id} key={farm.id}>
            {farm.farmerName} · {farm.village}
          </option>
        ))}
      </select>
    </div>
  );
}
