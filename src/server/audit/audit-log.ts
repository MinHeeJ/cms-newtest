import type { AuditEvent } from "@/lib/site-creation/types";
import { appendAuditEvent } from "@/server/site-creation/site-draft-repository";

export async function recordAuditEvent(input: Omit<AuditEvent, "id" | "created_at">) {
  return appendAuditEvent({
    ...input,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString()
  });
}
