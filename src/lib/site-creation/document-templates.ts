import type { CmsSiteDraft, DomainDefinition, GenerationStage } from "./types";

const requiredFilenames = ["spec.md", "plan.md", "tasks.md"] as const;

export function requiredDocumentFilenames() {
  return requiredFilenames;
}

export function buildDocumentSet(
  draft: CmsSiteDraft,
  domain: DomainDefinition,
  stages: GenerationStage[]
) {
  return {
    "spec.md": buildSpecDocument(draft, domain, stages),
    "plan.md": buildPlanDocument(draft, domain, stages),
    "tasks.md": buildTasksDocument(draft, domain, stages)
  };
}

function dependencySentence(domain: DomainDefinition) {
  if (domain.requires.length === 0) {
    return "This domain has no requires dependencies and can be generated at the first stage.";
  }

  return `This domain requires ${domain.requires.join(", ")} and must be generated in the same or a later stage.`;
}

function stageSentence(domain: DomainDefinition, stages: GenerationStage[]) {
  const stage = stages.find((item) => item.domain_codes.includes(domain.domain_code));
  return `The generation_order stage for ${domain.domain_code} is ${stage?.stage_number ?? domain.default_generation_order}.`;
}

function buildSpecDocument(draft: CmsSiteDraft, domain: DomainDefinition, stages: GenerationStage[]) {
  return `# Specification: ${domain.display_name}

## Context

${draft.site_name} is a CMS site draft for ${draft.target_audience || "administrative CMS operators"}. The ${domain.domain_code} domain defines ${domain.description.toLowerCase()}

## Requirements

- Preserve the domain code ${domain.domain_code} in API paths, table names, filenames, and enum values.
- ${dependencySentence(domain)}
- ${stageSentence(domain, stages)}
- Generated prose must remain English while identifiers such as spec.md, plan.md, tasks.md, requires, and generation_order are preserved.

## Acceptance Criteria

- Operators can review the scope of ${domain.domain_code} before handoff.
- Dependencies are visible and satisfied by the resolved generation_order.
- The draft bundle includes spec.md, plan.md, and tasks.md for this domain.
`;
}

function buildPlanDocument(draft: CmsSiteDraft, domain: DomainDefinition, stages: GenerationStage[]) {
  const stage = stages.find((item) => item.domain_codes.includes(domain.domain_code));

  return `# Plan: ${domain.display_name}

## Technical Approach

Implement ${domain.domain_code} as part of the ${draft.site_slug} CMS site creation scope. The domain belongs to the ${domain.capability} capability group and uses the resolved requires list: ${domain.requires.length > 0 ? domain.requires.join(", ") : "none"}.

## generation_order

Stage ${stage?.stage_number ?? domain.default_generation_order}: ${stage?.domain_codes.join(", ") ?? domain.domain_code}

## Handoff Notes

- Confirm that upstream domains are complete before implementation starts.
- Keep generated content reviewable as a draft and do not auto-approve the bundle.
- Preserve spec.md, plan.md, tasks.md, ${domain.domain_code}, requires, and generation_order exactly.
`;
}

function buildTasksDocument(draft: CmsSiteDraft, domain: DomainDefinition, stages: GenerationStage[]) {
  const stage = stages.find((item) => item.domain_codes.includes(domain.domain_code));

  return `# Tasks: ${domain.display_name}

- [ ] Confirm ${domain.domain_code} scope for ${draft.site_name}.
- [ ] Verify requires dependencies: ${domain.requires.length > 0 ? domain.requires.join(", ") : "none"}.
- [ ] Implement domain behavior after generation_order stage ${stage?.stage_number ?? domain.default_generation_order} is ready.
- [ ] Add tests for the ${domain.domain_code} workflow.
- [ ] Review spec.md, plan.md, and tasks.md before approving handoff.
`;
}
