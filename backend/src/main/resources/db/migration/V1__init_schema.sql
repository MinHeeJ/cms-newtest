CREATE TABLE IF NOT EXISTS cms_folders (
  folder_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_folder_id UUID REFERENCES cms_folders(folder_id),
  name VARCHAR(200) NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(120) NOT NULL,
  updated_by VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT cms_folders_no_self_parent CHECK (parent_folder_id IS NULL OR parent_folder_id <> folder_id)
);

COMMENT ON TABLE cms_folders IS '콘텐츠 분류를 위한 계층형 폴더. 포털에는 활성 및 미삭제 폴더만 노출된다.';
COMMENT ON COLUMN cms_folders.parent_folder_id IS 'cms_folders.folder_id 참조 의도 (자기참조 FK 선언)';
COMMENT ON COLUMN cms_folders.active IS 'true:활성|false:비활성';
COMMENT ON COLUMN cms_folders.deleted IS 'true:삭제됨|false:사용중';

CREATE UNIQUE INDEX IF NOT EXISTS ux_cms_folders_parent_name_active ON cms_folders (COALESCE(parent_folder_id, '00000000-0000-0000-0000-000000000000'::uuid), name) WHERE deleted = false;
CREATE INDEX IF NOT EXISTS ix_cms_folders_parent_order ON cms_folders (parent_folder_id, sort_order) WHERE deleted = false;

CREATE TABLE IF NOT EXISTS cms_documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id UUID NOT NULL REFERENCES cms_folders(folder_id),
  title VARCHAR(240) NOT NULL,
  markdown_body TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  display_order INTEGER NOT NULL DEFAULT 0,
  version INTEGER NOT NULL DEFAULT 1,
  published_at TIMESTAMPTZ,
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(120) NOT NULL,
  updated_by VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_cms_documents_status CHECK (status IN ('DRAFT','REVIEW','PUBLISHED','UNPUBLISHED','DELETED'))
);

COMMENT ON TABLE cms_documents IS '마크다운 원문과 게시 상태를 보존하는 CMS 문서. 발행 상태와 논리삭제 여부가 포털 및 검색 노출을 통제한다.';
COMMENT ON COLUMN cms_documents.status IS 'DRAFT:초안|REVIEW:검토|PUBLISHED:발행|UNPUBLISHED:게시중단|DELETED:삭제';
COMMENT ON COLUMN cms_documents.deleted IS 'true:삭제됨|false:사용중';
COMMENT ON COLUMN cms_documents.version IS 'Document update/publish/unpublish/delete 시 애플리케이션에서 증가';
CREATE INDEX IF NOT EXISTS ix_cms_documents_folder_order ON cms_documents (folder_id, display_order) WHERE deleted = false;
CREATE INDEX IF NOT EXISTS ix_cms_documents_status_published ON cms_documents (status, published_at) WHERE deleted = false;
CREATE INDEX IF NOT EXISTS ix_cms_documents_search ON cms_documents USING gin (to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(markdown_body, '')));

CREATE TABLE IF NOT EXISTS cms_attachments (
  attachment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES cms_documents(document_id),
  file_name VARCHAR(255) NOT NULL,
  content_type VARCHAR(120) NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_key VARCHAR(700) NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  deleted BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR(120) NOT NULL,
  updated_by VARCHAR(120) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_cms_attachments_status CHECK (status IN ('AVAILABLE','ORPHANED','FAILED','DELETED'))
);

COMMENT ON TABLE cms_attachments IS '문서와 파일 저장소 객체를 연결하는 첨부파일 메타데이터. 삭제 또는 저장소 불일치는 상태로 추적한다.';
COMMENT ON COLUMN cms_attachments.status IS 'AVAILABLE:사용가능|ORPHANED:고아파일|FAILED:처리실패|DELETED:삭제';
COMMENT ON COLUMN cms_attachments.deleted IS 'true:삭제됨|false:사용중';
COMMENT ON COLUMN cms_attachments.storage_key IS 'Attachment upload 시 애플리케이션에서 비추측 키로 생성';
CREATE INDEX IF NOT EXISTS ix_cms_attachments_document ON cms_attachments (document_id, created_at DESC) WHERE deleted = false;

CREATE TABLE IF NOT EXISTS cms_audit_logs (
  audit_log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor VARCHAR(120) NOT NULL,
  action VARCHAR(60) NOT NULL,
  target_type VARCHAR(60) NOT NULL,
  target_id VARCHAR(120) NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE cms_audit_logs IS '콘텐츠, 파일, 운영, 사업관리 변경 이력을 append-only로 기록한다. 사용자 응답에는 내부 오류 상세 대신 traceId만 전달한다.';
COMMENT ON COLUMN cms_audit_logs.target_id IS '대상 테이블별 PK 참조 의도 (다형성으로 FK 미선언)';
CREATE INDEX IF NOT EXISTS ix_cms_audit_logs_created ON cms_audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS ix_cms_audit_logs_target ON cms_audit_logs (target_type, target_id);

CREATE TABLE IF NOT EXISTS cms_operation_jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(30) NOT NULL,
  status VARCHAR(40) NOT NULL,
  requested_by VARCHAR(120) NOT NULL,
  detail TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_cms_operation_jobs_type CHECK (job_type IN ('BACKUP','MIGRATION'))
);

COMMENT ON TABLE cms_operation_jobs IS '백업/복구와 데이터 이관 장기 작업의 요청 및 결과를 추적한다. 실제 저장소 작업기는 추후 운영 환경 정책에 맞게 이 테이블을 소비한다.';
COMMENT ON COLUMN cms_operation_jobs.status IS 'REQUESTED:요청됨|RUNNING:실행중|SUCCEEDED:성공|FAILED:실패|RESTORED:복구완료|RESTORE_REQUESTED:복구요청|PARTIAL_FAILED:부분실패';
CREATE INDEX IF NOT EXISTS ix_cms_operation_jobs_type_created ON cms_operation_jobs (job_type, created_at DESC);

CREATE TABLE IF NOT EXISTS cms_project_records (
  record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module VARCHAR(30) NOT NULL,
  title VARCHAR(240) NOT NULL,
  owner VARCHAR(120) NOT NULL,
  status VARCHAR(50) NOT NULL,
  severity VARCHAR(30),
  version VARCHAR(40),
  approval_state VARCHAR(40),
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT ck_cms_project_records_module CHECK (module IN ('SCHEDULE','SCOPE','STAFF','RISK','DELIVERABLE','CHANGE'))
);

COMMENT ON TABLE cms_project_records IS '일정, 범위, 인력, 위험, 산출물, 변경 요청을 모듈별로 관리하는 사업관리 레코드. 모듈별 상태 enum은 애플리케이션 검증과 컬럼 설명으로 추적한다.';
COMMENT ON COLUMN cms_project_records.status IS 'PLANNED:계획됨|IN_PROGRESS:진행중|DELAYED:지연|DONE:완료|REGISTERED:등록|REVIEWING:검토중|HOLD:보류|EXCLUDED:제외|ACTIVE:활성|INACTIVE:비활성|PENDING_CHANGE:변경대기|ANALYZING:분석중|ACTIONING:조치중|RESOLVED:해결|CLOSED:종료|DRAFT:초안|SUBMITTED:제출|APPROVED:승인|REJECTED:반려|REQUESTED:요청|IMPACT_ANALYSIS:영향분석|PENDING_APPROVAL:승인대기|APPLYING:반영중|VERIFIED:검증완료';
COMMENT ON COLUMN cms_project_records.severity IS 'LOW:낮음|MEDIUM:보통|HIGH:높음|CRITICAL:치명';
COMMENT ON COLUMN cms_project_records.approval_state IS 'DRAFT:초안|SUBMITTED:제출|APPROVED:승인|REJECTED:반려|PENDING:대기';
CREATE INDEX IF NOT EXISTS ix_cms_project_records_module_created ON cms_project_records (module, created_at DESC);
