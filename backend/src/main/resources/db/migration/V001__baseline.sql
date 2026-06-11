create table members (
  id varchar(36) primary key,
  email varchar(255) not null unique,
  password_hash varchar(255) not null,
  nickname varchar(40) not null unique,
  profile_image_url varchar(500),
  bio varchar(500),
  status varchar(32) not null,
  role varchar(32) not null,
  notification_preferences text,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  last_login_at timestamptz
);

create table boards (
  id varchar(36) primary key,
  slug varchar(80) not null unique,
  name varchar(80) not null unique,
  description varchar(500),
  visibility varchar(32) not null,
  posting_policy varchar(32) not null,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table board_category_options (
  board_id varchar(36) not null references boards(id) on delete cascade,
  category varchar(40) not null,
  primary key (board_id, category)
);

create table posts (
  id varchar(36) primary key,
  board_id varchar(36) not null references boards(id),
  author_id varchar(36) not null references members(id),
  title varchar(120) not null,
  body text not null,
  category varchar(40),
  status varchar(32) not null,
  is_notice boolean not null default false,
  is_pinned boolean not null default false,
  view_count integer not null default 0,
  comment_count integer not null default 0,
  reaction_count integer not null default 0,
  report_count integer not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table comments (
  id varchar(36) primary key,
  post_id varchar(36) not null references posts(id),
  author_id varchar(36) not null references members(id),
  parent_comment_id varchar(36) references comments(id),
  body varchar(2000) not null,
  status varchar(32) not null,
  depth integer not null default 0,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  deleted_at timestamptz
);

create table reactions (
  id varchar(36) primary key,
  post_id varchar(36) not null references posts(id),
  member_id varchar(36) not null references members(id),
  type varchar(32) not null,
  created_at timestamptz not null,
  unique (post_id, member_id)
);

create table board_subscriptions (
  id varchar(36) primary key,
  member_id varchar(36) not null references members(id),
  board_id varchar(36) not null references boards(id),
  created_at timestamptz not null,
  unique (member_id, board_id)
);

create table bookmarks (
  id varchar(36) primary key,
  member_id varchar(36) not null references members(id),
  post_id varchar(36) not null references posts(id),
  created_at timestamptz not null,
  unique (member_id, post_id)
);

create table notifications (
  id varchar(36) primary key,
  recipient_id varchar(36) not null references members(id),
  type varchar(32) not null,
  title varchar(120) not null,
  message varchar(500) not null,
  target_type varchar(40),
  target_id varchar(36),
  read_at timestamptz,
  created_at timestamptz not null
);

create table reports (
  id varchar(36) primary key,
  reporter_id varchar(36) not null references members(id),
  target_type varchar(32) not null,
  target_id varchar(36) not null,
  reason_code varchar(32) not null,
  description varchar(1000),
  status varchar(32) not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table moderation_actions (
  id varchar(36) primary key,
  actor_id varchar(36) not null references members(id),
  report_id varchar(36) references reports(id),
  target_type varchar(32) not null,
  target_id varchar(36) not null,
  action_type varchar(32) not null,
  reason varchar(1000) not null,
  visible_to_member boolean not null default true,
  created_at timestamptz not null
);

create table audit_events (
  id varchar(36) primary key,
  actor_id varchar(36),
  event_type varchar(80) not null,
  target_type varchar(40),
  target_id varchar(36),
  summary varchar(1000) not null,
  metadata text,
  created_at timestamptz not null
);
