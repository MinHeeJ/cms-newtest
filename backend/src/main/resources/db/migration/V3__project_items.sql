CREATE TABLE IF NOT EXISTS cms_project_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area VARCHAR(40) NOT NULL,
  title VARCHAR(300) NOT NULL,
  status VARCHAR(40) NOT NULL,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES cms_users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cms_project_items_area_status ON cms_project_items(area, status, created_at DESC);
