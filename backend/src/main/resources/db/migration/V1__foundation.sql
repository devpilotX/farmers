CREATE TABLE farm (
  id UUID PRIMARY KEY,
  organisation_id UUID NOT NULL,
  farmer_name VARCHAR(100) NOT NULL,
  village VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  crop VARCHAR(20) NOT NULL CHECK (crop IN ('Paddy', 'Maize', 'Vegetables')),
  stage VARCHAR(30) NOT NULL CHECK (stage IN ('Sowing', 'Growing', 'Ready to harvest')),
  area_hectares NUMERIC(8,2) NOT NULL CHECK (area_hectares > 0 AND area_hectares <= 10000),
  assets TEXT NOT NULL CHECK (length(assets) <= 500),
  boundary JSONB NOT NULL CHECK (jsonb_typeof(boundary) = 'array'),
  consent_version VARCHAR(30) NOT NULL CHECK (consent_version = 'registry-v1-en'),
  consent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  request_id UUID NOT NULL,
  request_hash CHAR(64) NOT NULL,
  UNIQUE (organisation_id, request_id),
  UNIQUE (id, organisation_id)
);
CREATE TABLE action_task (
  id UUID PRIMARY KEY,
  farm_id UUID NOT NULL,
  organisation_id UUID NOT NULL,
  title VARCHAR(200) NOT NULL,
  detail VARCHAR(500) NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL CHECK (position >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (farm_id, organisation_id) REFERENCES farm(id, organisation_id),
  UNIQUE (farm_id, position)
);
CREATE TABLE audit_event (
  id UUID PRIMARY KEY,
  organisation_id UUID NOT NULL,
  farm_id UUID NOT NULL REFERENCES farm(id),
  event_type VARCHAR(40) NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
