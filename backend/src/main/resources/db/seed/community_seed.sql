insert into members (id, email, password_hash, nickname, status, role, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000001', 'admin@example.com', '{noop}password1234', '운영관리자', 'ACTIVE', 'ADMIN', now(), now()),
  ('00000000-0000-0000-0000-000000000002', 'moderator@example.com', '{noop}password1234', '게시판지기', 'ACTIVE', 'MODERATOR', now(), now()),
  ('00000000-0000-0000-0000-000000000003', 'member@example.com', '{noop}password1234', '새벽독자', 'ACTIVE', 'MEMBER', now(), now()),
  ('00000000-0000-0000-0000-000000000004', 'writer@example.com', '{noop}password1234', '동네기록자', 'ACTIVE', 'MEMBER', now(), now())
on conflict (id) do nothing;

insert into boards (id, slug, name, description, visibility, posting_policy, sort_order, is_archived, created_at, updated_at)
values
  ('10000000-0000-0000-0000-000000000001', 'free', '자유게시판', '일상 이야기와 가벼운 잡담을 나누는 공간입니다.', 'PUBLIC', 'MEMBERS', 1, false, now(), now()),
  ('10000000-0000-0000-0000-000000000002', 'info', '정보공유', '생활, 기술, 지역 정보를 정리해서 공유합니다.', 'PUBLIC', 'MEMBERS', 2, false, now(), now()),
  ('10000000-0000-0000-0000-000000000003', 'qna', '질문답변', '궁금한 점을 묻고 답변을 모으는 공간입니다.', 'PUBLIC', 'MEMBERS', 3, false, now(), now())
on conflict (id) do nothing;

insert into board_category_options (board_id, category)
values
  ('10000000-0000-0000-0000-000000000001', '잡담'),
  ('10000000-0000-0000-0000-000000000001', '후기'),
  ('10000000-0000-0000-0000-000000000002', '정보'),
  ('10000000-0000-0000-0000-000000000002', '가이드'),
  ('10000000-0000-0000-0000-000000000003', '질문'),
  ('10000000-0000-0000-0000-000000000003', '해결')
on conflict do nothing;

insert into posts (id, board_id, author_id, title, body, category, status, is_notice, is_pinned, view_count, comment_count, reaction_count, report_count, created_at, updated_at)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '커뮤니티 이용 안내', '서로 존중하며 읽기 쉬운 제목과 말머리를 사용해주세요.', '공지', 'PUBLISHED', true, true, 120, 0, 5, 0, now() - interval '2 day', now() - interval '2 day'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', '오늘 점심 메뉴 추천 모음', '회사 근처에서 빠르게 먹기 좋은 메뉴를 댓글로 모아봅니다.', '잡담', 'PUBLISHED', false, false, 92, 1, 7, 0, now() - interval '4 hour', now() - interval '4 hour'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '초보자를 위한 게시글 작성 팁', '제목은 구체적으로, 본문은 문단을 나누면 더 많은 답변을 받을 수 있습니다.', '가이드', 'PUBLISHED', false, false, 76, 0, 4, 0, now() - interval '1 hour', now() - interval '1 hour')
on conflict (id) do nothing;

insert into comments (id, post_id, author_id, body, status, depth, created_at, updated_at)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '근처 국밥집 회전이 빨라서 점심시간에 좋았습니다.', 'PUBLISHED', 0, now() - interval '3 hour', now() - interval '3 hour')
on conflict (id) do nothing;

insert into notifications (id, recipient_id, type, title, message, target_type, target_id, created_at)
values
  ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'NOTICE', '운영 안내', '새 공지와 신고 처리 결과는 알림함에서 확인할 수 있습니다.', 'POST', '20000000-0000-0000-0000-000000000001', now() - interval '1 day')
on conflict (id) do nothing;
