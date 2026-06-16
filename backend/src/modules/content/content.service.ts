import { conflict, forbidden, notFound, validationError } from "../../api/middleware/error-handler.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { canEditContent, hasPermission } from "../auth/permissions.js";
import type { ContentCreateInput, ContentItem, ContentUpdateInput, User } from "./content.types.js";
import { contentRepository } from "./content.repository.js";
import { revisionRepository } from "./revision.repository.js";

function assertSlugAvailable(slug: string, currentContentId?: string): void {
  const existing = contentRepository.findBySlug(slug);
  if (existing && existing.id !== currentContentId) {
    throw conflict("이미 사용 중인 slug입니다.");
  }
}

export function assertPublishable(content: ContentItem): void {
  const missing: string[] = [];
  if (!content.title.trim()) missing.push("제목");
  if (!content.slug.trim()) missing.push("slug");
  if (!content.markdownBody.trim()) missing.push("본문");
  if (!content.contentType) missing.push("콘텐츠 유형");
  if (!content.visibility) missing.push("공개 범위");
  if (content.featuredMedia?.mimeType.startsWith("image/") && !content.featuredMedia.altText?.trim()) {
    missing.push("대표 이미지 대체 텍스트");
  }

  if (missing.length > 0) {
    throw validationError(`게시 조건을 충족하지 못했습니다: ${missing.join(", ")}`);
  }
}

export class ContentService {
  create(input: ContentCreateInput, user: User): ContentItem {
    if (!hasPermission(user, "content:create")) {
      throw forbidden();
    }

    assertSlugAvailable(input.slug);
    const content = contentRepository.create(input, user);
    revisionRepository.create(content, user, "초안 생성");
    workflowEventService.write({
      eventType: "CREATE",
      actor: user,
      targetType: "ContentItem",
      targetId: content.id,
      afterState: { status: content.status, title: content.title, slug: content.slug }
    });
    return content;
  }

  update(contentId: string, input: ContentUpdateInput, user: User): ContentItem {
    const content = this.get(contentId);
    if (!canEditContent(user, content)) {
      throw forbidden();
    }

    if (input.expectedRevision && input.expectedRevision !== content.revisionsCount) {
      throw conflict("최신 revision과 다릅니다. 비교 후 다시 저장해 주세요.");
    }

    assertSlugAvailable(input.slug, contentId);
    const beforeState = { title: content.title, slug: content.slug, status: content.status, revision: content.revisionsCount };
    const updated = contentRepository.update(content, input);
    revisionRepository.create(updated, user, input.changeSummary ?? "콘텐츠 수정");
    workflowEventService.write({
      eventType: "UPDATE",
      actor: user,
      targetType: "ContentItem",
      targetId: updated.id,
      beforeState,
      afterState: { title: updated.title, slug: updated.slug, status: updated.status, revision: updated.revisionsCount },
      comment: input.changeSummary
    });
    return updated;
  }

  get(contentId: string): ContentItem {
    const content = contentRepository.findById(contentId);
    if (!content) {
      throw notFound("콘텐츠를 찾을 수 없습니다.");
    }
    return content;
  }
}

export const contentService = new ContentService();
