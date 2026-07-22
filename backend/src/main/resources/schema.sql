CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE users IS '공지사항 서비스 인증 사용자와 관리자 권한을 보존한다.';
COMMENT ON COLUMN users.role IS 'USER:일반사용자|ADMIN:관리자';

CREATE TABLE IF NOT EXISTS notices (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  author_id BIGINT NOT NULL REFERENCES users(id),
  published BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE notices IS '관리자가 등록하고 사용자가 열람하는 커뮤니티 공지 본문이다.';
COMMENT ON COLUMN notices.view_count IS 'Notice detail API 조회 시 애플리케이션에서 증가';

CREATE TABLE IF NOT EXISTS comments (
  id BIGSERIAL PRIMARY KEY,
  notice_id BIGINT NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  author_id BIGINT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE comments IS '공지사항 상세에 작성되는 단일 단계 댓글이며 공지 삭제 시 함께 삭제된다.';

CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('NEW_COMMENT')),
  message VARCHAR(255) NOT NULL,
  reference_id BIGINT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
COMMENT ON TABLE notifications IS '댓글 작성 등 사용자에게 전달할 읽음 상태 알림을 보존한다.';
COMMENT ON COLUMN notifications.type IS 'NEW_COMMENT:새댓글';
COMMENT ON COLUMN notifications.reference_id IS 'notices.id 참조 의도 (FK 미선언)';

CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices(published);
CREATE INDEX IF NOT EXISTS idx_comments_notice_id ON comments(notice_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
