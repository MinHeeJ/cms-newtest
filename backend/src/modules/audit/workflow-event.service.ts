import { createId, getDataStore, timestamp } from "../../persistence/database.js";
import type { User, WorkflowEvent, WorkflowEventType } from "../content/content.types.js";

export interface WorkflowEventInput {
  eventType: WorkflowEventType;
  actor: User;
  targetType: string;
  targetId: string;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  comment?: string | null;
}

export class WorkflowEventService {
  write(input: WorkflowEventInput): WorkflowEvent {
    const event: WorkflowEvent = {
      id: createId(),
      eventType: input.eventType,
      actor: {
        id: input.actor.id,
        email: input.actor.email,
        displayName: input.actor.displayName
      },
      targetType: input.targetType,
      targetId: input.targetId,
      beforeState: input.beforeState ?? null,
      afterState: input.afterState ?? null,
      comment: input.comment ?? null,
      createdAt: timestamp()
    };

    getDataStore().workflowEvents.unshift(event);
    return event;
  }
}

export const workflowEventService = new WorkflowEventService();
