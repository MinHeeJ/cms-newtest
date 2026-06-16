import type { ValidationIssue, ValidationOutcome } from "./types";

export function validationOutcomeForIssues(issues: ValidationIssue[]): ValidationOutcome {
  if (issues.some((issue) => issue.severity === "blocker")) {
    return "blocked";
  }

  if (issues.some((issue) => issue.severity === "warning")) {
    return "passed_with_warnings";
  }

  return "passed";
}

export function formatValidationIssue(issue: ValidationIssue) {
  const domain = issue.domain_code ? `${issue.domain_code}: ` : "";
  return `${domain}${issue.message}`;
}

export function sortValidationIssues(issues: ValidationIssue[]) {
  return [...issues].sort((left, right) => {
    if (left.severity !== right.severity) {
      return left.severity === "blocker" ? -1 : 1;
    }

    return left.code.localeCompare(right.code);
  });
}
