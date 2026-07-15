CREATE TABLE IF NOT EXISTS cms_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID REFERENCES cms_folders(id),
  name VARCHAR(200) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  version BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_id, name)
);
CREATE INDEX IF NOT EXISTS idx_cms_folders_parent_order ON cms_folders(parent_id, display_order);
ALTER TABLE cms_content_items ADD COLUMN folder_id UUID REFERENCES cms_folders(id);
CREATE TABLE IF NOT EXISTS cms_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES cms_content_items(id),
  original_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL UNIQUE,
  mime_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
  content BYTEA NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cms_attachments_document ON cms_attachments(document_id, deleted_at);
CREATE TABLE IF NOT EXISTS cms_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_id UUID,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS cms_operation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(40) NOT NULL,
  status VARCHAR(20) NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
