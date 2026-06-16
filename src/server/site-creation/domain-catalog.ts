import type { DomainDefinition } from "@/lib/site-creation/types";

export const defaultDomainCatalog: DomainDefinition[] = [
  {
    domain_code: "cms-core",
    display_name: "CMS Core",
    description: "the foundational workspace, routing, persistence, and shared CMS conventions.",
    selectable: false,
    requires: [],
    default_generation_order: 1,
    default_enabled: true,
    capability: "Core"
  },
  {
    domain_code: "content-model",
    display_name: "Content Model",
    description: "content types, fields, relationships, validation rules, and editorial metadata.",
    selectable: true,
    requires: ["cms-core"],
    default_generation_order: 2,
    capability: "Content"
  },
  {
    domain_code: "media-library",
    display_name: "Media Library",
    description: "asset upload, metadata, reuse, and governance for images and documents.",
    selectable: true,
    requires: ["cms-core"],
    default_generation_order: 2,
    capability: "Content"
  },
  {
    domain_code: "access-control",
    display_name: "Access Control",
    description: "administrator roles, permissions, operator auditability, and protected workflows.",
    selectable: true,
    requires: ["cms-core"],
    default_generation_order: 2,
    capability: "Governance"
  },
  {
    domain_code: "page-builder",
    display_name: "Page Builder",
    description: "page composition, reusable blocks, previews, and structured page assembly.",
    selectable: true,
    requires: ["cms-core", "content-model"],
    default_generation_order: 3,
    capability: "Experience"
  },
  {
    domain_code: "publishing-workflow",
    display_name: "Publishing Workflow",
    description: "review states, scheduling, publication controls, and rollback expectations.",
    selectable: true,
    requires: ["cms-core", "content-model", "access-control"],
    default_generation_order: 3,
    capability: "Governance"
  },
  {
    domain_code: "navigation",
    display_name: "Navigation",
    description: "menus, hierarchical navigation, redirects, and portal entry points.",
    selectable: true,
    requires: ["cms-core", "content-model"],
    default_generation_order: 3,
    capability: "Experience"
  },
  {
    domain_code: "analytics",
    display_name: "Analytics",
    description: "usage events, editorial performance, search insights, and operational dashboards.",
    selectable: true,
    requires: ["cms-core"],
    default_generation_order: 4,
    capability: "Insights"
  }
];

export function getDomainCatalog() {
  return defaultDomainCatalog;
}

export function getDomainDefinition(domainCode: string) {
  return defaultDomainCatalog.find((domain) => domain.domain_code === domainCode);
}
