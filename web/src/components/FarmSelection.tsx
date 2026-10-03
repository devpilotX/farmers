import type { Farm, Route } from "../types";
import { navigate } from "../navigation";
export function FarmSelection({
  farms,
  selected,
  route,
}: {
  farms: Farm[];
  selected: string;
  route: Route;
}) {
  return (
    <div className="farm-selection no-print">
      <label htmlFor="selected-farm">Selected farm</label>
      <select
        id="selected-farm"
        value={selected}
        onChange={(event) => navigate(route, event.target.value)}
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
