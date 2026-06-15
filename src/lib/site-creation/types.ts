export type SiteDraftStatus =
  | "draft"
  | "validating"
  | "ready_to_generate"
  | "generating"
  | "generated"
  | "blocked"
  | "archived";

export type ValidationOutcome = "passed" | "passed_with_warnings" | "blocked";
export type ValidationSeverity = "blocker" | "warning";

export type ValidationIssueCode =
  | "MISSING_DOMAIN"
  | "INVALID_GENERATION_ORDER"
  | "CYCLIC_DEPENDENCY"
  | "NON_ENGLISH_PROSE"
  | "STALE_DOCUMENT_BUNDLE";

export type GenerationJobStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export type DocumentBundleStatus =
  | "pending"
  | "generated"
  | "stale"
  | "failed"
  | "approved";

export type DomainCapability =
  | "Core"
  | "Content"
  | "Experience"
  | "Governance"
  | "Insights";

export interface DomainDefinition {
  domain_code: string;
  display_name: string;
  description: string;
  selectable: boolean;
  requires: string[];
  default_generation_order: number;
  default_enabled?: boolean;
  capability: DomainCapability;
}

export interface DomainSelection {
  domain_code: string;
  source: "selected" | "auto_added";
  required_by?: string;
}

export interface GenerationStage {
  stage_number: number;
  domain_codes: string[];
  dependency_summary?: string;
}

export interface Artifact {
  filename: "spec.md" | "plan.md" | "tasks.md";
  url: string;
  content?: string;
}

export interface DocumentBundle {
  id: string;
  domain_code: string;
  status: DocumentBundleStatus;
  artifacts: Artifact[];
  failure_reason?: string;
  language?: "English";
  generated_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface ValidationIssue {
  id?: string;
  severity: ValidationSeverity;
  code: ValidationIssueCode;
  domain_code?: string;
  message: string;
  suggested_action?: string;
}

export interface ValidationReport {
  id: string;
  outcome: ValidationOutcome;
  checked_at: string;
  checked_by?: string;
  issues: ValidationIssue[];
}

export interface GenerationJob {
  id: string;
  draft_id: string;
  status: GenerationJobStatus;
  progress: number;
  requested_at: string;
  requested_by?: string;
  finished_at?: string;
}

export interface CmsSiteDraft {
  id: string;
  site_name: string;
  site_slug: string;
  description?: string;
  target_audience?: string;
  status: SiteDraftStatus;
  selected_domains: string[];
  auto_added_domains: string[];
  effective_domains: string[];
  generation_stages: GenerationStage[];
  latest_validation?: ValidationReport;
  document_bundles: DocumentBundle[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface SiteDraftSummary {
  id: string;
  site_name: string;
  site_slug: string;
  status: SiteDraftStatus;
  effective_domain_count: number;
  validation_outcome?: ValidationOutcome;
  blocker_count: number;
  updated_at: string;
}

export interface CreateDraftRequest {
  site_name: string;
  site_slug?: string;
  description?: string;
  target_audience?: string;
  selected_domains: string[];
}

export interface UpdateDraftRequest {
  site_name?: string;
  site_slug?: string;
  description?: string;
  target_audience?: string;
  selected_domains?: string[];
}

export interface DependencyResolution {
  selected_domains: string[];
  auto_added_domains: string[];
  effective_domains: string[];
  selections: DomainSelection[];
  generation_stages: GenerationStage[];
  issues: ValidationIssue[];
}

export interface DashboardSummary {
  total_drafts: number;
  generated_drafts: number;
  blocked_drafts: number;
  average_domains_per_draft: number;
  recent_drafts: SiteDraftSummary[];
  blockers: Array<{
    draft_id: string;
    site_name: string;
    issue: ValidationIssue;
  }>;
}

export interface AuditEvent {
  id: string;
  draft_id?: string;
  actor_id: string;
  event_type: string;
  event_payload: Record<string, unknown>;
  created_at: string;
}

export interface SiteCreationStore {
  drafts: CmsSiteDraft[];
  jobs: GenerationJob[];
  audit_events: AuditEvent[];
}
