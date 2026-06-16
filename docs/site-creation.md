# CMS Site Creation Operator Workflow

## Create a Draft

1. Open **Create CMS Site**.
2. Enter `site_name`, optional description, and target audience.
3. Select at least one selectable CMS domain.
4. Continue to save the draft.

The system resolves `requires` dependencies, stores selected domains separately from auto-added domains, and displays the effective domain set.

## Validate and Generate

1. Review the stage timeline and dependency graph.
2. Run **Validate Plan**.
3. Resolve any blocker before handoff or generation.
4. Run **Generate Documents** when validation is not blocked.

Every generated effective domain receives `spec.md`, `plan.md`, and `tasks.md`. Generated prose is English and preserves identifiers such as domain codes, `requires`, and `generation_order`.

## Monitor History

The dashboard and drafts table show draft status, validation outcome, effective domain count, and last update time. Blocked drafts are highlighted in the dashboard blocker panel.
