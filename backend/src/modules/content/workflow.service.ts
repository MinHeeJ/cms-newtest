import { forbidden, validationError } from "../../api/middleware/error-handler.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { canEditContent, hasPermission } from "../auth/permissions.js";
import { timestamp } from "../../persistence/database.js";
import type { ContentItem, User } from "./content.types.js";
import { assertPublishable, contentService } from "./content.service.js";
import { contentRepository } from "./content.repository.js";

export class WorkflowService {
  submit(contentId: string, user: User): ContentItem {
    const content = contentService.get(contentId);
    if (!canEditContent(user, content) || !hasPermission(user, "content:submit")) {
      throw forbidden();
    }
    if (!["DRAFT", "APPROVED"].includes(content.status)) {
      throw validationError("검토 요청은 초안 또는 승인 상태에서만 가능합니다.");
    }

    const beforeState = { status: content.status };
    content.status = "IN_REVIEW";
    contentRepository.save(content);
    workflowEventService.write({
      eventType: "SUBMIT",
      actor: user,
      targetType: "ContentItem",
      targetId: content.id,
      beforeState,
      afterState: { status: content.status }
    });
    return content;
  }

  publish(contentId: string, user: User): ContentItem {
    const content = contentService.get(contentId);
    if (!hasPermission(user, "content:publish")) {
      throw forbidden();
    }
    if (!["APPROVED", "SCHEDULED", "PUBLISHED"].includes(content.status)) {
      throw validationError("승인된 콘텐츠만 게시할 수 있습니다.");
    }

    assertPublishable(content);
    const beforeState = { status: content.status, publishedAt: content.publishedAt };
    content.status = "PUBLISHED";
    content.publishedAt = timestamp();
    content.scheduledAt = null;
    contentRepository.save(content);
    workflowEventService.write({
      eventType: "PUBLISH",
      actor: user,
      targetType: "ContentItem",
      targetId: content.id,
      beforeState,
      afterState: { status: content.status, publishedAt: content.publishedAt }
    });
    return content;
  }

  unpublish(contentId: string, user: User): ContentItem {
    const content = contentService.get(contentId);
    if (!hasPermission(user, "content:publish")) {
      throw forbidden();
    }
    const beforeState = { status: content.status, publishedAt: content.publishedAt };
    content.status = "DRAFT";
    content.publishedAt = null;
    contentRepository.save(content);
    workflowEventService.write({
      eventType: "UNPUBLISH",
      actor: user,
      targetType: "ContentItem",
      targetId: content.id,
      beforeState,
      afterState: { status: content.status, publishedAt: content.publishedAt }
    });
    return content;
  }

  archive(contentId: string, user: User): ContentItem {
    const content = contentService.get(contentId);
    if (!hasPermission(user, "content:archive")) {
      throw forbidden();
    }
    const beforeState = { status: content.status };
    content.status = "ARCHIVED";
    content.archivedAt = timestamp();
    contentRepository.save(content);
    workflowEventService.write({
      eventType: "ARCHIVE",
      actor: user,
      targetType: "ContentItem",
      targetId: content.id,
      beforeState,
      afterState: { status: content.status, archivedAt: content.archivedAt }
    });
    return content;
  }
}

export const workflowService = new WorkflowService();
