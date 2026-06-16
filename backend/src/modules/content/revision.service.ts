import { forbidden, notFound } from "../../api/middleware/error-handler.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { canEditContent } from "../auth/permissions.js";
import type { ContentItem, ContentRevision, User } from "./content.types.js";
import { contentRepository } from "./content.repository.js";
import { contentService } from "./content.service.js";
import { revisionRepository } from "./revision.repository.js";

export interface RevisionCompareResult {
  base: ContentRevision;
  target: ContentRevision;
  changes: Array<{ field: string; before: unknown; after: unknown }>;
}

export class RevisionService {
  list(contentId: string): ContentRevision[] {
    contentService.get(contentId);
    return revisionRepository.listByContent(contentId);
  }

  compare(contentId: string, baseRevisionId: string, targetRevisionId: string): RevisionCompareResult {
    const base = revisionRepository.find(contentId, baseRevisionId);
    const target = revisionRepository.find(contentId, targetRevisionId);
    if (!base || !target) {
      throw notFound("revision을 찾을 수 없습니다.");
    }

    const changes: RevisionCompareResult["changes"] = [];
    if (base.titleSnapshot !== target.titleSnapshot) {
      changes.push({ field: "title", before: base.titleSnapshot, after: target.titleSnapshot });
    }
    if (base.markdownBodySnapshot !== target.markdownBodySnapshot) {
      changes.push({ field: "markdownBody", before: base.markdownBodySnapshot, after: target.markdownBodySnapshot });
    }
    for (const key of new Set([...Object.keys(base.metadataSnapshot), ...Object.keys(target.metadataSnapshot)])) {
      if (JSON.stringify(base.metadataSnapshot[key]) !== JSON.stringify(target.metadataSnapshot[key])) {
        changes.push({ field: key, before: base.metadataSnapshot[key], after: target.metadataSnapshot[key] });
      }
    }
    return { base, target, changes };
  }

  restore(contentId: string, revisionId: string, user: User): ContentItem {
    const content = contentService.get(contentId);
    if (!canEditContent(user, content)) {
      throw forbidden();
    }
    const revision = revisionRepository.find(contentId, revisionId);
    if (!revision) {
      throw notFound("revision을 찾을 수 없습니다.");
    }

    const beforeState = { status: content.status, revision: content.revisionsCount };
    content.title = revision.titleSnapshot;
    content.markdownBody = revision.markdownBodySnapshot;
    content.summary = String(revision.metadataSnapshot.summary ?? "");
    content.visibility = String(revision.metadataSnapshot.visibility ?? "PUBLIC") as ContentItem["visibility"];
    content.status = "DRAFT";
    content.publishedAt = null;
    content.scheduledAt = null;
    contentRepository.save(content);
    revisionRepository.create(content, user, `revision ${revision.revisionNumber} 복원`);
    workflowEventService.write({
      eventType: "UPDATE",
      actor: user,
      targetType: "ContentItem",
      targetId: content.id,
      beforeState,
      afterState: { status: content.status, revision: content.revisionsCount },
      comment: "이전 revision을 새 초안으로 복원"
    });
    return content;
  }
}

export const revisionService = new RevisionService();
