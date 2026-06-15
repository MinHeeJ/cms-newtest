import type {
  DependencyResolution,
  DomainDefinition,
  DomainSelection,
  GenerationStage,
  ValidationIssue
} from "./types";

export function resolveDomainDependencies(
  selectedDomainCodes: string[],
  catalog: DomainDefinition[]
): DependencyResolution {
  const selected_domains = Array.from(new Set(selectedDomainCodes));
  const catalogByCode = new Map(catalog.map((domain) => [domain.domain_code, domain]));
  const issues: ValidationIssue[] = [];
  const autoAdded = new Map<string, string>();
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const effective = new Set<string>();

  const includeDomain = (domainCode: string, requiredBy?: string) => {
    const domain = catalogByCode.get(domainCode);
    if (!domain) {
      issues.push({
        severity: "blocker",
        code: "MISSING_DOMAIN",
        domain_code: domainCode,
        message: `Domain ${domainCode} is not defined in the CMS domain catalog.`,
        suggested_action: "Add the missing domain to the catalog or remove it from the draft."
      });
      return;
    }

    if (visiting.has(domainCode)) {
      issues.push({
        severity: "blocker",
        code: "CYCLIC_DEPENDENCY",
        domain_code: domainCode,
        message: `Domain ${domainCode} participates in a cyclic requires dependency.`,
        suggested_action: "Remove the cycle from the domain catalog before generation."
      });
      return;
    }

    if (visited.has(domainCode)) {
      return;
    }

    visiting.add(domainCode);

    for (const requiredDomainCode of domain.requires) {
      if (!selected_domains.includes(requiredDomainCode) && !autoAdded.has(requiredDomainCode)) {
        autoAdded.set(requiredDomainCode, domainCode);
      }
      includeDomain(requiredDomainCode, domainCode);
    }

    visiting.delete(domainCode);
    visited.add(domainCode);
    effective.add(domainCode);

    if (requiredBy && !selected_domains.includes(domainCode)) {
      autoAdded.set(domainCode, requiredBy);
    }
  };

  for (const domainCode of selected_domains) {
    const domain = catalogByCode.get(domainCode);
    if (domain && !domain.selectable) {
      issues.push({
        severity: "blocker",
        code: "MISSING_DOMAIN",
        domain_code: domainCode,
        message: `Domain ${domainCode} cannot be selected directly.`,
        suggested_action: "Select a CMS capability that requires this foundational domain."
      });
    }
    includeDomain(domainCode);
  }

  const effective_domains = Array.from(effective).sort((left, right) => {
    const leftDomain = catalogByCode.get(left);
    const rightDomain = catalogByCode.get(right);
    const orderDelta =
      (leftDomain?.default_generation_order ?? 999) - (rightDomain?.default_generation_order ?? 999);
    return orderDelta === 0 ? left.localeCompare(right) : orderDelta;
  });

  const auto_added_domains = effective_domains.filter(
    (domainCode) => autoAdded.has(domainCode) && !selected_domains.includes(domainCode)
  );

  const selections: DomainSelection[] = effective_domains.map((domainCode) => {
    if (selected_domains.includes(domainCode)) {
      return { domain_code: domainCode, source: "selected" };
    }

    return {
      domain_code: domainCode,
      source: "auto_added",
      required_by: autoAdded.get(domainCode)
    };
  });

  const generation_stages = buildGenerationStages(effective_domains, catalogByCode);

  return {
    selected_domains,
    auto_added_domains,
    effective_domains,
    selections,
    generation_stages,
    issues
  };
}

export function buildGenerationStages(
  domainCodes: string[],
  catalogByCode: Map<string, DomainDefinition>
): GenerationStage[] {
  const stages = new Map<number, string[]>();

  for (const domainCode of domainCodes) {
    const order = catalogByCode.get(domainCode)?.default_generation_order ?? 1;
    const existing = stages.get(order) ?? [];
    existing.push(domainCode);
    stages.set(order, existing);
  }

  return Array.from(stages.entries())
    .sort(([left], [right]) => left - right)
    .map(([stage_number, codes], index) => ({
      stage_number: index + 1,
      domain_codes: codes.sort(),
      dependency_summary:
        index === 0
          ? "Foundational domains are established first."
          : "All requires dependencies are satisfied by this stage or an earlier stage."
    }));
}

export function findGenerationOrderIssues(
  stages: GenerationStage[],
  catalog: DomainDefinition[]
): ValidationIssue[] {
  const catalogByCode = new Map(catalog.map((domain) => [domain.domain_code, domain]));
  const stageByDomain = new Map<string, number>();
  const issues: ValidationIssue[] = [];

  for (const stage of stages) {
    for (const domainCode of stage.domain_codes) {
      stageByDomain.set(domainCode, stage.stage_number);
    }
  }

  for (const [domainCode, stageNumber] of stageByDomain.entries()) {
    const definition = catalogByCode.get(domainCode);
    if (!definition) {
      issues.push({
        severity: "blocker",
        code: "MISSING_DOMAIN",
        domain_code: domainCode,
        message: `Domain ${domainCode} is not defined in the CMS domain catalog.`,
        suggested_action: "Add the missing domain to the catalog or remove it from the draft."
      });
      continue;
    }

    for (const requiredDomainCode of definition.requires) {
      const requiredStage = stageByDomain.get(requiredDomainCode);
      if (!requiredStage) {
        issues.push({
          severity: "blocker",
          code: "MISSING_DOMAIN",
          domain_code: domainCode,
          message: `Domain ${domainCode} requires ${requiredDomainCode}, but it is not in the effective domain set.`,
          suggested_action: `Add ${requiredDomainCode} or remove ${domainCode}.`
        });
        continue;
      }

      if (requiredStage > stageNumber) {
        issues.push({
          severity: "blocker",
          code: "INVALID_GENERATION_ORDER",
          domain_code: domainCode,
          message: `Domain ${domainCode} appears before required domain ${requiredDomainCode}.`,
          suggested_action: `Move ${requiredDomainCode} to stage ${stageNumber} or earlier.`
        });
      }
    }
  }

  return issues;
}
