import { forbidden, validationError } from "../../api/middleware/error-handler.js";
import { createId, getDataStore, timestamp } from "../../persistence/database.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { hasPermission } from "../auth/permissions.js";
import type { PublicationSchedule, ScheduleInput, User } from "./content.types.js";
import { assertPublishable, contentService } from "./content.service.js";
import { contentRepository } from "./content.repository.js";

export class ScheduleService {
  create(contentId: string, input: ScheduleInput, user: User): PublicationSchedule {
    if (!hasPermission(user, "content:publish")) {
      throw forbidden();
    }

    const content = contentService.get(contentId);
    if (!["APPROVED", "SCHEDULED"].includes(content.status)) {
      throw validationError("승인된 콘텐츠만 예약 게시할 수 있습니다.");
    }
    assertPublishable(content);

    const scheduledAt = new Date(input.scheduledAt);
    if (!Number.isFinite(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      throw validationError("예약 게시 시각은 현재보다 미래여야 합니다.");
    }

    const activeSchedule = getDataStore().schedules.find((schedule) => schedule.contentItemId === contentId && schedule.status === "PENDING");
    if (activeSchedule) {
      throw validationError("이미 활성 예약 게시가 있습니다.");
    }

    const schedule: PublicationSchedule = {
      id: createId(),
      contentItemId: content.id,
      scheduledAt: scheduledAt.toISOString(),
      status: "PENDING",
      requestedBy: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      },
      executedAt: null,
      failureReason: null,
      createdAt: timestamp()
    };

    const beforeState = { status: content.status, scheduledAt: content.scheduledAt };
    getDataStore().schedules.push(schedule);
    content.status = "SCHEDULED";
    content.scheduledAt = schedule.scheduledAt;
    contentRepository.save(content);
    workflowEventService.write({
      eventType: "SCHEDULE",
      actor: user,
      targetType: "ContentItem",
      targetId: content.id,
      beforeState,
      afterState: { status: content.status, scheduledAt: content.scheduledAt },
      comment: input.timezone ? `timezone=${input.timezone}` : null
    });
    return schedule;
  }

  cancel(contentId: string, user: User): PublicationSchedule | undefined {
    if (!hasPermission(user, "content:publish")) {
      throw forbidden();
    }

    const schedule = getDataStore().schedules.find((candidate) => candidate.contentItemId === contentId && candidate.status === "PENDING");
    if (!schedule) {
      return undefined;
    }
    schedule.status = "CANCELLED";
    schedule.executedAt = timestamp();
    return schedule;
  }
}

export const scheduleService = new ScheduleService();
