ALTER TABLE farm ADD COLUMN version integer NOT NULL DEFAULT 1 CHECK (version >= 1);
ALTER TABLE farm ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();
UPDATE farm SET updated_at = created_at;

ALTER TABLE audit_event ADD COLUMN request_id uuid;
ALTER TABLE audit_event ADD COLUMN request_hash char(64);
ALTER TABLE audit_event ADD COLUMN expected_version integer;
ALTER TABLE audit_event ADD COLUMN record_version integer;
ALTER TABLE audit_event ADD COLUMN changed_fields jsonb;
ALTER TABLE audit_event ADD COLUMN reason varchar(300);
ALTER TABLE audit_event ADD CONSTRAINT correction_request_unique UNIQUE (organisation_id, request_id);
ALTER TABLE audit_event ADD CONSTRAINT correction_metadata CHECK (
    (event_type = 'FARM_CORRECTED' AND request_id IS NOT NULL AND request_hash IS NOT NULL
     AND expected_version IS NOT NULL AND expected_version >= 1
     AND record_version IS NOT NULL AND record_version::bigint = expected_version::bigint + 1
     AND reason IS NOT NULL AND length(btrim(reason)) > 0
     AND changed_fields IS NOT NULL AND jsonb_typeof(changed_fields) = 'array'
     AND jsonb_array_length(changed_fields) BETWEEN 1 AND 5
     AND changed_fields <@ '["crop","stage","areaHectares","assets","boundary"]'::jsonb)
    OR (event_type <> 'FARM_CORRECTED' AND request_id IS NULL AND request_hash IS NULL
        AND expected_version IS NULL AND record_version IS NULL AND changed_fields IS NULL AND reason IS NULL)
);
