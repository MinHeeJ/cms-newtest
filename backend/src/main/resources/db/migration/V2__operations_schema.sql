CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS verification_records (
  record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_achievement_id UUID NOT NULL,
  owner_id VARCHAR(80) NOT NULL,
  owner_name VARCHAR(120) NOT NULL,
  organization_id VARCHAR(80) NOT NULL,
  evaluation_area VARCHAR(80) NOT NULL,
  verification_status VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
  decision_type VARCHAR(40),
  opinion TEXT,
  evidence TEXT,
  processed_by VARCHAR(80),
  processed_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE verification_records IS '업무담당자가 담당 범위의 미확인 실적을 인증·반려·인증취소한 결과를 보존한다.';
COMMENT ON COLUMN verification_records.verification_status IS 'UNVERIFIED:미확인|CERTIFIED:인증|REJECTED:반려|CANCELED:취소';
COMMENT ON COLUMN verification_records.source_achievement_id IS 'source_achievements.id 참조 의도 (FK 미선언)';
COMMENT ON COLUMN verification_records.owner_id IS 'user_accounts.id 참조 의도 (FK 미선언)';

CREATE TABLE IF NOT EXISTS payment_approvals (
  application_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id VARCHAR(80) NOT NULL,
  applicant_name VARCHAR(120) NOT NULL,
  organization_id VARCHAR(80) NOT NULL,
  requested_amount NUMERIC(14,2) NOT NULL,
  payment_amount NUMERIC(14,2) NOT NULL,
  bank_name VARCHAR(80) NOT NULL,
  account_last4 VARCHAR(4) NOT NULL,
  linked_achievement TEXT NOT NULL,
  approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  decision_reason TEXT,
  processed_by VARCHAR(80),
  processed_at TIMESTAMPTZ,
  financial_transfer_executed BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE payment_approvals IS '학술지원금 신청의 지급승인 상태와 처리자를 추적하며 실제 금융거래는 수행하지 않는다.';
COMMENT ON COLUMN payment_approvals.approval_status IS 'PENDING:대기|APPROVED:승인|REJECTED:반려|CANCELED:취소';
COMMENT ON COLUMN payment_approvals.applicant_id IS 'user_accounts.id 참조 의도 (FK 미선언)';

CREATE TABLE IF NOT EXISTS rejection_reasons (
  reason_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_type VARCHAR(80) NOT NULL,
  reason_code VARCHAR(80) NOT NULL,
  standard_message TEXT NOT NULL,
  allow_additional_comment BOOLEAN NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_rejection_reasons_type_code UNIQUE (business_type, reason_code)
);
COMMENT ON TABLE rejection_reasons IS '업무유형별 표준 반려사유 코드와 문구 및 추가 의견 허용 여부를 관리한다.';
COMMENT ON COLUMN rejection_reasons.business_type IS '업무유형 코드 참조 의도 (FK 미선언)';

CREATE TABLE IF NOT EXISTS appeal_opinions (
  appeal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id VARCHAR(80) NOT NULL,
  applicant_name VARCHAR(120) NOT NULL,
  application_content TEXT NOT NULL,
  applicant_opinion TEXT NOT NULL,
  reviewer_opinion TEXT,
  processing_result VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  processed_by VARCHAR(80),
  processed_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE appeal_opinions IS '이의신청 건별 신청내용과 신청자·검토자 의견 및 처리결과를 같은 appeal_id 흐름으로 보존한다.';
COMMENT ON COLUMN appeal_opinions.processing_result IS 'PENDING:대기|ACCEPTED:인정|REJECTED:기각|PARTIAL:부분인정';
COMMENT ON COLUMN appeal_opinions.applicant_id IS 'user_accounts.id 참조 의도 (FK 미선언)';

CREATE TABLE IF NOT EXISTS evaluation_batches (
  batch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type VARCHAR(40) NOT NULL,
  evaluation_year INTEGER NOT NULL,
  evaluation_area VARCHAR(80) NOT NULL,
  target_condition TEXT NOT NULL,
  generation_criteria TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'SUCCEEDED',
  total_count INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  excluded_count INTEGER NOT NULL DEFAULT 0,
  requested_by VARCHAR(80),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reason TEXT
);
COMMENT ON TABLE evaluation_batches IS '평가자료 생성·삭제·재계산 등 일괄작업의 조건, 기준, 상태와 결과 건수를 보존한다.';
COMMENT ON COLUMN evaluation_batches.status IS 'BATCH_CREATED:생성됨|RUNNING:실행중|SUCCEEDED:성공|FAILED:실패';
COMMENT ON COLUMN evaluation_batches.requested_by IS 'user_accounts.id 참조 의도 (FK 미선언)';

CREATE TABLE IF NOT EXISTS evaluation_materials (
  material_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_achievement_id UUID NOT NULL,
  generation_batch_id UUID NOT NULL REFERENCES evaluation_batches(batch_id),
  evaluation_year INTEGER NOT NULL,
  evaluation_area VARCHAR(80) NOT NULL,
  organization_id VARCHAR(80) NOT NULL,
  target_user_id VARCHAR(80) NOT NULL,
  target_user_name VARCHAR(120) NOT NULL,
  score NUMERIC(8,2) NOT NULL DEFAULT 0,
  material_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  deleted_reason TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE evaluation_materials IS '원천 실적에서 생성된 평가자료와 생성 배치 연결을 보존하며 원천 실적 자체는 변경하지 않는다.';
COMMENT ON COLUMN evaluation_materials.material_status IS 'ACTIVE:활성|DELETED:삭제';
COMMENT ON COLUMN evaluation_materials.source_achievement_id IS 'source_achievements.id 참조 의도 (FK 미선언)';
COMMENT ON COLUMN evaluation_materials.target_user_id IS 'user_accounts.id 참조 의도 (FK 미선언)';

CREATE TABLE IF NOT EXISTS score_recalculation_diffs (
  diff_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES evaluation_batches(batch_id),
  target_user_id VARCHAR(80) NOT NULL,
  evaluation_area VARCHAR(80) NOT NULL,
  before_score NUMERIC(8,2) NOT NULL,
  after_score NUMERIC(8,2) NOT NULL,
  formula_version VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE score_recalculation_diffs IS '점수 재계산 전후 점수와 산식버전을 배치 단위로 비교하기 위해 보존한다.';
COMMENT ON COLUMN score_recalculation_diffs.target_user_id IS 'user_accounts.id 참조 의도 (FK 미선언)';

CREATE TABLE IF NOT EXISTS final_evaluations (
  evaluation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_year INTEGER NOT NULL,
  organization_id VARCHAR(80) NOT NULL,
  target_user_id VARCHAR(80) NOT NULL,
  target_user_name VARCHAR(120) NOT NULL,
  final_score NUMERIC(8,2) NOT NULL,
  result_grade VARCHAR(40) NOT NULL,
  confirmation_status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
  confirmed_by VARCHAR(80),
  confirmed_at TIMESTAMPTZ,
  canceled_by VARCHAR(80),
  canceled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  version INTEGER NOT NULL DEFAULT 0
);
COMMENT ON TABLE final_evaluations IS '대상자별 최종평가 결과와 확정·취소 상태 및 처리 이력을 보존한다.';
COMMENT ON COLUMN final_evaluations.confirmation_status IS 'DRAFT:초안|CONFIRMED:확정|CANCELED:취소';
COMMENT ON COLUMN final_evaluations.target_user_id IS 'user_accounts.id 참조 의도 (FK 미선언)';

CREATE TABLE IF NOT EXISTS batch_results (
  result_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES evaluation_batches(batch_id),
  job_type VARCHAR(40) NOT NULL,
  target_identifier VARCHAR(160) NOT NULL,
  result_status VARCHAR(30) NOT NULL,
  error_code VARCHAR(80),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE batch_results IS '일괄처리 대상별 성공·실패·제외 결과와 오류 상세를 read-only 조회 용도로 보존한다.';
COMMENT ON COLUMN batch_results.result_status IS 'SUCCESS:성공|FAILED:실패|EXCLUDED:제외';

CREATE TABLE IF NOT EXISTS operations_audit_logs (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id VARCHAR(80) NOT NULL,
  action_type VARCHAR(80) NOT NULL,
  target_type VARCHAR(80) NOT NULL,
  target_id UUID NOT NULL,
  before_state TEXT,
  after_state TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE operations_audit_logs IS '공통 운영 관리 mutating operation의 처리자, 대상, 전후 상태와 의견을 감사 조회 가능하도록 보존한다.';
COMMENT ON COLUMN operations_audit_logs.actor_id IS 'user_accounts.id 참조 의도 (FK 미선언)';

CREATE INDEX IF NOT EXISTS idx_verification_records_scope_status ON verification_records (organization_id, verification_status);
CREATE INDEX IF NOT EXISTS idx_payment_approvals_scope_status ON payment_approvals (organization_id, approval_status);
CREATE INDEX IF NOT EXISTS idx_rejection_reasons_type_active ON rejection_reasons (business_type, active);
CREATE INDEX IF NOT EXISTS idx_appeal_opinions_result ON appeal_opinions (processing_result);
CREATE INDEX IF NOT EXISTS idx_evaluation_batches_year_area ON evaluation_batches (evaluation_year, evaluation_area, job_type);
CREATE INDEX IF NOT EXISTS idx_evaluation_materials_batch_status ON evaluation_materials (generation_batch_id, material_status);
CREATE INDEX IF NOT EXISTS idx_score_diffs_batch ON score_recalculation_diffs (batch_id);
CREATE INDEX IF NOT EXISTS idx_final_evaluations_scope_status ON final_evaluations (organization_id, confirmation_status);
CREATE INDEX IF NOT EXISTS idx_batch_results_batch ON batch_results (batch_id);

INSERT INTO evaluation_batches (batch_id, job_type, evaluation_year, evaluation_area, target_condition, generation_criteria, status, total_count, success_count, failed_count, excluded_count, requested_by)
VALUES ('40000000-0000-4000-8000-000000000001','GENERATE',2026,'TEACHING','ORG-001/PROF-001','UNCONFIRMED_ONLY','SUCCEEDED',3,2,1,0,'system') ON CONFLICT (batch_id) DO NOTHING;
INSERT INTO verification_records (record_id, source_achievement_id, owner_id, owner_name, organization_id, evaluation_area, verification_status)
VALUES
 ('10000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000001','PROF-001','김교수','ORG-001','TEACHING','UNVERIFIED'),
 ('10000000-0000-4000-8000-000000000002','90000000-0000-4000-8000-000000000002','PROF-002','이교수','ORG-002','RESEARCH','UNVERIFIED') ON CONFLICT (record_id) DO NOTHING;
INSERT INTO payment_approvals (application_id, applicant_id, applicant_name, organization_id, requested_amount, payment_amount, bank_name, account_last4, linked_achievement, approval_status)
VALUES
 ('20000000-0000-4000-8000-000000000001','PROF-001','김교수','ORG-001',1000000,950000,'국민','1234','논문 A-2026','PENDING'),
 ('20000000-0000-4000-8000-000000000002','PROF-002','이교수','ORG-002',800000,700000,'신한','5678','강의개선 B-2026','PENDING') ON CONFLICT (application_id) DO NOTHING;
INSERT INTO rejection_reasons (reason_id, business_type, reason_code, standard_message, allow_additional_comment, active)
VALUES ('60000000-0000-4000-8000-000000000001','VERIFICATION','VERIFY-DOC','증빙자료가 기준에 맞지 않습니다.',true,true) ON CONFLICT (business_type, reason_code) DO NOTHING;
INSERT INTO appeal_opinions (appeal_id, applicant_id, applicant_name, application_content, applicant_opinion, processing_result)
VALUES ('30000000-0000-4000-8000-000000000001','PROF-001','김교수','강의평가 점수 이의신청','누락된 강의평가 자료 반영 요청','PENDING') ON CONFLICT (appeal_id) DO NOTHING;
INSERT INTO evaluation_materials (material_id, source_achievement_id, generation_batch_id, evaluation_year, evaluation_area, organization_id, target_user_id, target_user_name, score, material_status)
VALUES ('70000000-0000-4000-8000-000000000001','90000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000001',2026,'TEACHING','ORG-001','PROF-001','김교수',88.5,'ACTIVE') ON CONFLICT (material_id) DO NOTHING;
INSERT INTO score_recalculation_diffs (diff_id, batch_id, target_user_id, evaluation_area, before_score, after_score, formula_version)
VALUES ('71000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','PROF-001','TEACHING',88.5,91.0,'FORMULA-2026-A') ON CONFLICT (diff_id) DO NOTHING;
INSERT INTO final_evaluations (evaluation_id, evaluation_year, organization_id, target_user_id, target_user_name, final_score, result_grade, confirmation_status)
VALUES
 ('50000000-0000-4000-8000-000000000001',2026,'ORG-001','PROF-001','김교수',92.5,'A','DRAFT'),
 ('50000000-0000-4000-8000-000000000002',2026,'ORG-002','PROF-002','이교수',81.0,'B','DRAFT') ON CONFLICT (evaluation_id) DO NOTHING;
INSERT INTO batch_results (result_id, batch_id, job_type, target_identifier, result_status, error_code, error_message)
VALUES
 ('80000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','GENERATE','PROF-001','SUCCESS',null,null),
 ('80000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000001','GENERATE','PROF-003','FAILED','SOURCE_MISSING','원천 실적이 없습니다.'),
 ('80000000-0000-4000-8000-000000000003','40000000-0000-4000-8000-000000000001','GENERATE','PROF-004','SUCCESS',null,null) ON CONFLICT (result_id) DO NOTHING;
