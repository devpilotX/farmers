import { useState } from "react";
import type { Farm } from "../types";
import { FarmCard } from "../components/FarmCard";
import { Icon } from "../components/Icon";
export function Registry({ farms }: { farms: Farm[] }) {
  const [query, setQuery] = useState("");
  const filtered = farms.filter((farm) =>
    `${farm.farmerName} ${farm.village} ${farm.crop}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="section-heading">
        <div>
          <span className="eyebrow">CONSENTED RECORDS</span>
          <h2>The farm registry</h2>
          <p className="muted">
            Find the people and plots behind your preparedness plan.
          </p>
        </div>
        <a className="button primary" href="#register">
          <Icon name="plus" />
          Register a farm
        </a>
      </div>
      <div className="search-row">
        <label htmlFor="farm-search">Find a farm</label>
        <input
          id="farm-search"
          type="search"
          placeholder="Name, village or crop"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span>{filtered.length} records</span>
      </div>
      <div className="farm-grid">
        {filtered.map((farm) => (
          <FarmCard key={farm.id} farm={farm} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <h3>
            {farms.length ? "No matching farms" : "No farms registered yet"}
          </h3>
          <p>
            {farms.length
              ? "Try another name, village or crop."
              : "Start with a consented farm record."}
          </p>
        </div>
      )}
    </>
  );
}
