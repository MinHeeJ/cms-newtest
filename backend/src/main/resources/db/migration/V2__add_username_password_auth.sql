ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS username VARCHAR(80);
ALTER TABLE cms_users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

UPDATE cms_users
SET username = CASE email
    WHEN 'admin@example.com' THEN 'basic'
    ELSE lower(split_part(email, '@', 1))
  END
WHERE username IS NULL OR username = '';

UPDATE cms_users
SET email = 'basic@example.com',
    display_name = '기본 관리자'
WHERE id = '11111111-1111-4111-8111-111111111111';

UPDATE cms_users
SET password_hash = '$2b$10$abcdefghijklmnopqrstuuMdsfVDZBhqbmBmmovbTxcYUWu/yLZaa'
WHERE password_hash IS NULL OR password_hash = '';

ALTER TABLE cms_users ALTER COLUMN username SET NOT NULL;
ALTER TABLE cms_users ALTER COLUMN password_hash SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_cms_users_username ON cms_users(username);
