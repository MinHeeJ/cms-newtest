CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS community_categories (
    id UUID PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    parent_id UUID NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_creatable BOOLEAN NOT NULL DEFAULT TRUE,
    requires_review BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 1
);

INSERT INTO community_categories (id, name, is_active, is_creatable, requires_review, display_order)
VALUES
    ('11111111-1111-1111-1111-111111111111', '엔터테인먼트', TRUE, TRUE, FALSE, 1),
    ('22222222-2222-2222-2222-222222222222', '금융/투자', TRUE, TRUE, TRUE, 2),
    ('33333333-3333-3333-3333-333333333333', '사회 이슈', TRUE, TRUE, TRUE, 3)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS community_creation_requests (
    id UUID PRIMARY KEY,
    creator_user_id UUID NOT NULL,
    idempotency_key VARCHAR(128),
    display_name VARCHAR(80),
    normalized_name VARCHAR(120),
    slug VARCHAR(40),
    category_id UUID REFERENCES community_categories(id),
    description VARCHAR(300),
    visibility VARCHAR(20),
    join_policy VARCHAR(30),
    status VARCHAR(30) NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    source VARCHAR(40),
    representative_image_id UUID,
    launched_community_id UUID,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_creation_requests_creator ON community_creation_requests (creator_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creation_requests_review_queue ON community_creation_requests (status, risk_level, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_creation_requests_slug ON community_creation_requests (slug);

CREATE TABLE IF NOT EXISTS community_request_risk_signals (
    request_id UUID NOT NULL REFERENCES community_creation_requests(id) ON DELETE CASCADE,
    signal_code VARCHAR(80) NOT NULL,
    PRIMARY KEY (request_id, signal_code)
);

CREATE TABLE IF NOT EXISTS community_request_validation_errors (
    request_id UUID NOT NULL REFERENCES community_creation_requests(id) ON DELETE CASCADE,
    field_name VARCHAR(120) NOT NULL,
    error_code VARCHAR(80) NOT NULL,
    message VARCHAR(300) NOT NULL
);

CREATE TABLE IF NOT EXISTS communities (
    id UUID PRIMARY KEY,
    display_name VARCHAR(80) NOT NULL,
    normalized_name VARCHAR(120) NOT NULL,
    slug VARCHAR(40) NOT NULL UNIQUE,
    category_id UUID NOT NULL REFERENCES community_categories(id),
    description VARCHAR(300) NOT NULL,
    visibility VARCHAR(20) NOT NULL,
    join_policy VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    owner_user_id UUID NOT NULL,
    representative_image_id UUID,
    launched_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS community_boards (
    id UUID PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    creation_request_id UUID REFERENCES community_creation_requests(id) ON DELETE CASCADE,
    name VARCHAR(60) NOT NULL,
    description VARCHAR(160),
    type VARCHAR(20) NOT NULL,
    post_permission VARCHAR(20) NOT NULL,
    comment_permission VARCHAR(20) NOT NULL,
    display_order INTEGER NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_community_boards_request ON community_boards (creation_request_id, display_order);
CREATE INDEX IF NOT EXISTS idx_community_boards_community ON community_boards (community_id, display_order);

CREATE TABLE IF NOT EXISTS community_rules (
    id UUID PRIMARY KEY,
    community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
    creation_request_id UUID REFERENCES community_creation_requests(id) ON DELETE CASCADE,
    title VARCHAR(80) NOT NULL,
    body VARCHAR(1200) NOT NULL,
    display_order INTEGER NOT NULL,
    required_rule BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_community_rules_request ON community_rules (creation_request_id, display_order);
CREATE INDEX IF NOT EXISTS idx_community_rules_community ON community_rules (community_id, display_order);

CREATE TABLE IF NOT EXISTS community_memberships (
    id UUID PRIMARY KEY,
    community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    invited_by_user_id UUID,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL,
    UNIQUE (community_id, user_id, status)
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_community_owner
    ON community_memberships (community_id)
    WHERE role = 'OWNER' AND status = 'ACTIVE';

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY,
    owner_user_id UUID NOT NULL,
    creation_request_id UUID REFERENCES community_creation_requests(id) ON DELETE SET NULL,
    community_id UUID REFERENCES communities(id) ON DELETE SET NULL,
    storage_key VARCHAR(180) NOT NULL,
    file_name VARCHAR(180) NOT NULL,
    mime_type VARCHAR(80) NOT NULL,
    byte_size BIGINT NOT NULL,
    width INTEGER NOT NULL,
    height INTEGER NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS moderator_invitations (
    id UUID PRIMARY KEY,
    creation_request_id UUID NOT NULL REFERENCES community_creation_requests(id) ON DELETE CASCADE,
    user_identifier VARCHAR(120) NOT NULL,
    message VARCHAR(240),
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS community_reviews (
    id UUID PRIMARY KEY,
    creation_request_id UUID NOT NULL REFERENCES community_creation_requests(id) ON DELETE CASCADE,
    reviewer_user_id UUID NOT NULL,
    decision VARCHAR(30) NOT NULL,
    reason_code VARCHAR(60) NOT NULL,
    reason_text VARCHAR(1200) NOT NULL,
    decided_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_community_reviews_request ON community_reviews (creation_request_id, decided_at DESC);

CREATE TABLE IF NOT EXISTS audit_events (
    id UUID PRIMARY KEY,
    actor_user_id UUID NOT NULL,
    subject_type VARCHAR(80) NOT NULL,
    subject_id UUID NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    summary VARCHAR(300) NOT NULL,
    metadata TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_events_subject ON audit_events (subject_type, subject_id, created_at);
