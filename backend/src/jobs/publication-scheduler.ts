import { getDataStore, timestamp } from "../persistence/database.js";
import { workflowEventService } from "../modules/audit/workflow-event.service.js";
import { contentRepository } from "../modules/content/content.repository.js";
import { assertPublishable } from "../modules/content/content.service.js";

export function runDuePublications(now = new Date()): number {
  const store = getDataStore();
  let completed = 0;

  for (const schedule of store.schedules.filter((candidate) => candidate.status === "PENDING" && new Date(candidate.scheduledAt) <= now)) {
    const content = contentRepository.findById(schedule.contentItemId);
    schedule.status = "RUNNING";
    if (!content || content.status === "ARCHIVED") {
      schedule.status = "FAILED";
      schedule.failureReason = "대상 콘텐츠가 없거나 보관 상태입니다.";
      schedule.executedAt = timestamp();
      continue;
    }

    try {
      assertPublishable(content);
      const beforeState = { status: content.status, scheduledAt: content.scheduledAt };
      content.status = "PUBLISHED";
      content.publishedAt = timestamp();
      content.scheduledAt = null;
      contentRepository.save(content);
      schedule.status = "SUCCEEDED";
      schedule.executedAt = timestamp();
      workflowEventService.write({
        eventType: "PUBLISH",
        actor: store.users[0],
        targetType: "ContentItem",
        targetId: content.id,
        beforeState,
        afterState: { status: content.status, publishedAt: content.publishedAt },
        comment: "예약 게시 worker 실행"
      });
      completed += 1;
    } catch (error) {
      schedule.status = "FAILED";
      schedule.failureReason = error instanceof Error ? error.message : "예약 게시 실패";
      schedule.executedAt = timestamp();
    }
  }

  return completed;
}
