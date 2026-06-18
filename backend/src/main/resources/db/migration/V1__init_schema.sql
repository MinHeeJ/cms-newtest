CREATE TABLE cms_users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  display_name  VARCHAR(255) NOT NULL,
  status        VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE cms_user_roles (
  user_id UUID        NOT NULL REFERENCES cms_users(id) ON DELETE CASCADE,
  role    VARCHAR(20) NOT NULL,
  PRIMARY KEY (user_id, role)
);

CREATE TABLE cms_taxonomy_terms (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  type        VARCHAR(20)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  parent_id   UUID         REFERENCES cms_taxonomy_terms(id),
  sort_order  INT,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE cms_media_assets (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name    VARCHAR(255) NOT NULL,
  mime_type    VARCHAR(100) NOT NULL,
  size_bytes   BIGINT       NOT NULL,
  storage_key  VARCHAR(500) NOT NULL,
  alt_text     TEXT,
  caption      TEXT,
  usage_count  INT          NOT NULL DEFAULT 0,
  uploaded_by  UUID         NOT NULL REFERENCES cms_users(id),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE cms_content_items (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type      VARCHAR(20)  NOT NULL,
  title             VARCHAR(160) NOT NULL,
  slug              VARCHAR(255) NOT NULL UNIQUE,
  status            VARCHAR(20)  NOT NULL DEFAULT 'DRAFT',
  summary           TEXT         NOT NULL DEFAULT '',
  markdown_body     TEXT         NOT NULL,
  visibility        VARCHAR(20)  NOT NULL DEFAULT 'PUBLIC',
  featured_media_id UUID         REFERENCES cms_media_assets(id),
  author_id         UUID         NOT NULL REFERENCES cms_users(id),
  revisions_count   INT          NOT NULL DEFAULT 0,
  published_at      TIMESTAMPTZ,
  scheduled_at      TIMESTAMPTZ,
  archived_at       TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE cms_content_categories (
  content_id UUID NOT NULL REFERENCES cms_content_items(id) ON DELETE CASCADE,
  term_id    UUID NOT NULL REFERENCES cms_taxonomy_terms(id),
  PRIMARY KEY (content_id, term_id)
);

CREATE TABLE cms_content_tags (
  content_id UUID NOT NULL REFERENCES cms_content_items(id) ON DELETE CASCADE,
  term_id    UUID NOT NULL REFERENCES cms_taxonomy_terms(id),
  PRIMARY KEY (content_id, term_id)
);

CREATE TABLE cms_content_revisions (
  id                     UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id        UUID  NOT NULL REFERENCES cms_content_items(id) ON DELETE CASCADE,
  revision_number        INT   NOT NULL,
  title_snapshot         VARCHAR(160) NOT NULL,
  metadata_snapshot      TEXT NOT NULL DEFAULT '{}',
  markdown_body_snapshot TEXT NOT NULL,
  change_summary         TEXT,
  created_by             UUID NOT NULL REFERENCES cms_users(id),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (content_item_id, revision_number)
);

CREATE TABLE cms_publication_schedules (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID        NOT NULL REFERENCES cms_content_items(id) ON DELETE CASCADE,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  requested_by    UUID        NOT NULL REFERENCES cms_users(id),
  executed_at     TIMESTAMPTZ,
  failure_reason  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cms_navigation_menus (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  key        VARCHAR(100) NOT NULL UNIQUE,
  label      VARCHAR(255) NOT NULL,
  is_active  BOOLEAN      NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE cms_navigation_items (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id     UUID        NOT NULL REFERENCES cms_navigation_menus(id) ON DELETE CASCADE,
  label       VARCHAR(255) NOT NULL,
  target_type VARCHAR(20) NOT NULL,
  target_id   UUID,
  url         TEXT,
  parent_id   UUID        REFERENCES cms_navigation_items(id),
  sort_order  INT         NOT NULL DEFAULT 0,
  is_visible  BOOLEAN     NOT NULL DEFAULT true
);

CREATE TABLE cms_workflow_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   VARCHAR(30) NOT NULL,
  actor_id     UUID        NOT NULL REFERENCES cms_users(id),
  target_type  VARCHAR(50) NOT NULL,
  target_id    UUID        NOT NULL,
  before_state TEXT,
  after_state  TEXT,
  comment      TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed
INSERT INTO cms_users (id, email, display_name, status) VALUES
  ('11111111-1111-4111-8111-111111111111', 'admin@example.com',  '관리자', 'ACTIVE'),
  ('22222222-2222-4222-8222-222222222222', 'editor@example.com', '편집자', 'ACTIVE'),
  ('33333333-3333-4333-8333-333333333333', 'author@example.com', '작성자', 'ACTIVE');

INSERT INTO cms_user_roles VALUES
  ('11111111-1111-4111-8111-111111111111', 'ADMIN'),
  ('22222222-2222-4222-8222-222222222222', 'EDITOR'),
  ('33333333-3333-4333-8333-333333333333', 'AUTHOR');

INSERT INTO cms_taxonomy_terms (id, type, name, slug, description, sort_order) VALUES
  ('44444444-4444-4444-8444-444444444444', 'CATEGORY', '공지', 'notice', '공개 공지 콘텐츠', 1),
  ('55555555-5555-4555-8555-555555555555', 'TAG', 'CMS', 'cms', 'CMS 운영 태그', 1);

INSERT INTO cms_content_items (id, content_type, title, slug, status, summary, markdown_body, visibility, author_id, revisions_count, published_at)
VALUES ('66666666-6666-4666-8666-666666666666', 'ARTICLE', '첫 번째 CMS 소식', 'first-cms-news', 'PUBLISHED',
        '마크다운 기반 CMS의 첫 게시글', E'# 첫 번째 CMS 소식\n\n본문을 **Markdown**으로 작성합니다.',
        'PUBLIC', '33333333-3333-4333-8333-333333333333', 1, now());

INSERT INTO cms_content_categories VALUES ('66666666-6666-4666-8666-666666666666','44444444-4444-4444-8444-444444444444');
INSERT INTO cms_content_tags     VALUES ('66666666-6666-4666-8666-666666666666','55555555-5555-4555-8555-555555555555');

INSERT INTO cms_content_revisions (id, content_item_id, revision_number, title_snapshot, metadata_snapshot, markdown_body_snapshot, change_summary, created_by)
VALUES ('77777777-7777-4777-8777-777777777777', '66666666-6666-4666-8666-666666666666', 1,
        '첫 번째 CMS 소식', '{}', E'# 첫 번째 CMS 소식\n\n본문을 **Markdown**으로 작성합니다.', '초기 게시', '33333333-3333-4333-8333-333333333333');

INSERT INTO cms_navigation_menus (id, key, label) VALUES ('88888888-8888-4888-8888-888888888888', 'primary', 'Primary Menu');
INSERT INTO cms_navigation_items (id, menu_id, label, target_type, target_id, sort_order) VALUES
  ('99999999-9999-4999-8999-999999999999', '88888888-8888-4888-8888-888888888888', '공지', 'CATEGORY', '44444444-4444-4444-8444-444444444444', 1);
