import { forbidden, validationError } from "../../api/middleware/error-handler.js";
import { timestamp } from "../../persistence/database.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { hasPermission } from "../auth/permissions.js";
import type { ContentItem, ReviewInput, User } from "./content.types.js";
import { contentRepository } from "./content.repository.js";
import { contentService } from "./content.service.js";

export class ReviewService {
  decide(contentId: string, input: ReviewInput, user: User): ContentItem {
    if (!hasPermission(user, "content:review")) {
      throw forbidden();
    }
    const content = contentService.get(contentId);
    if (content.status !== "IN_REVIEW") {
      throw validationError("검토 대기 상태의 콘텐츠만 승인 또는 반려할 수 있습니다.");
    }
    if (input.decision === "REJECT" && !input.comment?.trim()) {
      throw validationError("반려 사유를 입력해 주세요.");
    }

    const beforeState = { status: content.status };
    content.status = input.decision === "APPROVE" ? "APPROVED" : "DRAFT";
    content.updatedAt = timestamp();
    contentRepository.save(content);
    workflowEventService.write({
      eventType: input.decision === "APPROVE" ? "APPROVE" : "REJECT",
      actor: user,
      targetType: "ContentItem",
      targetId: content.id,
      beforeState,
      afterState: { status: content.status },
      comment: input.comment ?? null
    });
    return content;
  }
}

export const reviewService = new ReviewService();
