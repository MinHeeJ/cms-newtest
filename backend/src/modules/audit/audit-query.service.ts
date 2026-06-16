import { getDataStore, paginate } from "../../persistence/database.js";
import type { WorkflowEventType } from "../content/content.types.js";

export interface AuditQuery {
  page?: number;
  pageSize?: number;
  eventType?: WorkflowEventType;
  actorId?: string;
  targetType?: string;
  from?: string;
  to?: string;
}

export class AuditQueryService {
  list(query: AuditQuery) {
    const from = query.from ? new Date(query.from).getTime() : Number.NEGATIVE_INFINITY;
    const to = query.to ? new Date(query.to).getTime() : Number.POSITIVE_INFINITY;
    const items = getDataStore().workflowEvents.filter((event) => {
      const createdAt = new Date(event.createdAt).getTime();
      return (
        (!query.eventType || event.eventType === query.eventType) &&
        (!query.actorId || event.actor.id === query.actorId) &&
        (!query.targetType || event.targetType === query.targetType) &&
        createdAt >= from &&
        createdAt <= to
      );
    });

    return paginate(items, query.page, query.pageSize);
  }
}

export const auditQueryService = new AuditQueryService();
