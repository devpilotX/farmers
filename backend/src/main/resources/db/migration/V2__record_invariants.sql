ALTER TABLE farm ADD CONSTRAINT bounded_closed_boundary
  CHECK (jsonb_array_length(boundary) BETWEEN 4 AND 100 AND boundary->0 = boundary->-1);
ALTER TABLE audit_event ADD CONSTRAINT audit_farm_organisation
  FOREIGN KEY (farm_id, organisation_id) REFERENCES farm(id, organisation_id);
