create extension if not exists pgcrypto;

create table if not exists users (
    id bigserial primary key,
    username varchar(80) not null unique,
    display_name varchar(120) not null,
    role varchar(20) not null check (role in ('ADMIN', 'USER')),
    active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists folders (
    id bigserial primary key,
    parent_id bigint references folders(id),
    title varchar(120) not null,
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
    title varchar(200) not null,
    body_markdown text not null,
    status varchar(20) not null default 'DRAFT' check (status in ('DRAFT', 'PUBLISHED', 'UNPUBLISHED')),
    deleted boolean not null default false,
    sort_order integer not null default 0,
    author_name varchar(120),
    published_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists attachments (
    id bigserial primary key,
    original_name varchar(255) not null,
    storage_key varchar(500) not null unique,
    size_bytes bigint not null,
    content_type varchar(120) not null,
    extension varchar(20) not null,
    deleted boolean not null default false,
    created_at timestamptz not null default now()
);

create table if not exists article_attachments (
    article_id bigint not null references articles(id) on delete cascade,
    attachment_id bigint not null references attachments(id),
    created_at timestamptz not null default now(),
    primary key (article_id, attachment_id)
);

create table if not exists operation_audits (
    id bigserial primary key,
    actor varchar(120),
    action varchar(80) not null,
    target_type varchar(80) not null,
    target_id bigint,
    detail jsonb,
    created_at timestamptz not null default now()
);

create index if not exists idx_folders_parent_active on folders(parent_id, active) where deleted = false;
create index if not exists idx_folders_active_sort on folders(active, sort_order) where deleted = false;
create index if not exists idx_articles_folder_status on articles(folder_id, status, sort_order) where deleted = false;
create index if not exists idx_articles_status_published on articles(status, published_at desc) where deleted = false;
create index if not exists idx_articles_search_title on articles using gin (to_tsvector('simple', coalesce(title, '')));
create index if not exists idx_articles_search_body on articles using gin (to_tsvector('simple', coalesce(body_markdown, '')));
create index if not exists idx_attachments_storage_key on attachments(storage_key) where deleted = false;
create index if not exists idx_article_attachments_article on article_attachments(article_id);
create index if not exists idx_article_attachments_attachment on article_attachments(attachment_id);

insert into users(username, display_name, role)
values ('admin', '관리자', 'ADMIN'), ('user', '포털 사용자', 'USER')
on conflict (username) do nothing;

insert into folders(id, parent_id, title, description, active, sort_order)
values
    (1, null, '공지', '사내 공지와 운영 안내', true, 10),
    (2, null, '지식 문서', '업무 지식과 매뉴얼', true, 20)
on conflict (id) do nothing;

insert into articles(id, folder_id, title, body_markdown, status, sort_order, author_name, published_at)
values
    (1, 1, 'CMS 시작 안내', '# CMS 시작 안내\n\n포털에서 발행 문서를 탐색하고 검색할 수 있습니다.', 'PUBLISHED', 10, 'admin', now())
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('folders', 'id'), greatest((select max(id) from folders), 1), true);
select setval(pg_get_serial_sequence('articles', 'id'), greatest((select max(id) from articles), 1), true);
