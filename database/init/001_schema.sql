create table if not exists users (
    id bigserial primary key,
    username varchar(80) not null unique,
    password_hash varchar(255) not null,
    display_name varchar(120) not null,
    role varchar(20) not null check (role in ('ADMIN', 'USER')),
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists folders (
    id bigserial primary key,
    parent_id bigint references folders(id),
    title varchar(160) not null,
    description varchar(500),
    active boolean not null default true,
    deleted boolean not null default false,
    sort_order integer not null default 0,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists articles (
    id bigserial primary key,
    folder_id bigint not null references folders(id),
    title varchar(220) not null,
    body text not null,
    status varchar(20) not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'UNPUBLISHED')),
    deleted boolean not null default false,
    sort_order integer not null default 0,
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists attachments (
    id bigserial primary key,
    ref_type varchar(40) not null,
    ref_id bigint not null,
    original_name varchar(255) not null,
    storage_key varchar(500) not null unique,
    size_bytes bigint not null,
    content_type varchar(160),
    extension varchar(20) not null,
    deleted boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists article_attachments (
    article_id bigint not null references articles(id) on delete cascade,
    attachment_id bigint not null references attachments(id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (article_id, attachment_id)
);

create table if not exists operation_audit (
    id bigserial primary key,
    actor_username varchar(80),
    action varchar(80) not null,
    target_type varchar(40) not null,
    target_id bigint,
    message varchar(1000),
    created_at timestamptz not null default now()
);

create index if not exists idx_folders_parent_active on folders(parent_id, active) where deleted = false;
create index if not exists idx_folders_active_sort on folders(active, sort_order) where deleted = false;
create index if not exists idx_articles_folder_status on articles(folder_id, status, sort_order) where deleted = false;
create index if not exists idx_articles_published on articles(status, published_at desc) where deleted = false;
create index if not exists idx_articles_search_title on articles using gin (to_tsvector('simple', coalesce(title, ''))) where deleted = false;
create index if not exists idx_articles_search_body on articles using gin (to_tsvector('simple', coalesce(body, ''))) where deleted = false;
create index if not exists idx_attachments_ref on attachments(ref_type, ref_id) where deleted = false;
create index if not exists idx_article_attachments_attachment on article_attachments(attachment_id);
create index if not exists idx_audit_target on operation_audit(target_type, target_id, created_at desc);

insert into users(username, password_hash, display_name, role)
values
    ('admin', '{noop}admin123', 'CMS 관리자', 'ADMIN'),
    ('user', '{noop}user123', '포털 사용자', 'USER')
on conflict (username) do nothing;

insert into folders(id, parent_id, title, description, active, sort_order)
values
    (1, null, '공지사항', '전사 공지와 운영 안내', true, 0),
    (2, null, '업무 지식', '업무별 지식 문서', true, 1),
    (3, 2, '운영 가이드', '운영 절차와 장애 대응', true, 0)
on conflict (id) do nothing;

insert into articles(id, folder_id, title, body, status, sort_order, published_at)
values
    (1, 1, 'CMS 포털 안내', '# CMS 포털 안내\n\n게시된 지식 문서를 폴더와 검색으로 확인할 수 있습니다.', 'PUBLISHED', 0, now()),
    (2, 3, '운영 점검 체크리스트', '# 운영 점검 체크리스트\n\n- 헬스체크 확인\n- PostgreSQL 백업 확인\n- uploads 볼륨 사용량 확인', 'PUBLISHED', 0, now())
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('folders', 'id'), greatest((select max(id) from folders), 1));
select setval(pg_get_serial_sequence('articles', 'id'), greatest((select max(id) from articles), 1));
