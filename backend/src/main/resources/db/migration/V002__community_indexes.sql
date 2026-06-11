create index idx_boards_navigation on boards (visibility, is_archived, sort_order);
create index idx_posts_board_feed on posts (board_id, status, is_pinned desc, is_notice desc, created_at desc);
create index idx_posts_popular on posts (status, reaction_count desc, comment_count desc, view_count desc, created_at desc);
create index idx_posts_search_title on posts using gin (to_tsvector('simple', title));
create index idx_posts_search_body on posts using gin (to_tsvector('simple', body));
create index idx_comments_post_thread on comments (post_id, parent_comment_id, created_at);
create index idx_notifications_recipient on notifications (recipient_id, read_at, created_at desc);
create index idx_reports_queue on reports (status, created_at desc);
create index idx_audit_events_target on audit_events (target_type, target_id, created_at desc);
