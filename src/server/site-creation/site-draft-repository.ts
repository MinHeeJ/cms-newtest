import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  AuditEvent,
  CmsSiteDraft,
  GenerationJob,
  SiteCreationStore,
  SiteDraftStatus
} from "@/lib/site-creation/types";
import { SiteCreationError } from "@/server/api/response";

const emptyStore = (): SiteCreationStore => ({
  drafts: [],
  jobs: [],
  audit_events: []
});

function dataFilePath() {
  return process.env.SITE_CREATION_DATA_FILE ?? path.join(process.cwd(), ".data", "site-creation.json");
}

async function readStore(): Promise<SiteCreationStore> {
  try {
    const contents = await readFile(dataFilePath(), "utf8");
    return JSON.parse(contents) as SiteCreationStore;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return emptyStore();
    }
    throw error;
  }
}

async function writeStore(store: SiteCreationStore) {
  const filePath = dataFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

async function mutateStore<T>(callback: (store: SiteCreationStore) => T | Promise<T>) {
  const store = await readStore();
  const result = await callback(store);
  await writeStore(store);
  return result;
}

export async function ensureUniqueSlug(baseSlug: string, ignoreDraftId?: string) {
  const store = await readStore();
  let candidate = baseSlug;
  let suffix = 2;

  while (
    store.drafts.some((draft) => draft.site_slug === candidate && draft.id !== ignoreDraftId)
  ) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

export async function listSiteDrafts(options?: { status?: SiteDraftStatus; limit?: number }) {
  const store = await readStore();
  return store.drafts
    .filter((draft) => (options?.status ? draft.status === options.status : true))
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
    .slice(0, options?.limit ?? 25);
}

export async function getSiteDraft(draftId: string) {
  const store = await readStore();
  return store.drafts.find((draft) => draft.id === draftId);
}

export async function requireSiteDraft(draftId: string) {
  const draft = await getSiteDraft(draftId);
  if (!draft) {
    throw new SiteCreationError(404, "NOT_FOUND", "The CMS site draft was not found.");
  }
  return draft;
}

export async function saveSiteDraft(draft: CmsSiteDraft) {
  return mutateStore((store) => {
    const index = store.drafts.findIndex((item) => item.id === draft.id);
    if (index >= 0) {
      store.drafts[index] = draft;
    } else {
      store.drafts.push(draft);
    }
    return draft;
  });
}

export async function updateSiteDraftRecord(
  draftId: string,
  updater: (draft: CmsSiteDraft) => CmsSiteDraft
) {
  return mutateStore((store) => {
    const index = store.drafts.findIndex((draft) => draft.id === draftId);
    if (index < 0) {
      throw new SiteCreationError(404, "NOT_FOUND", "The CMS site draft was not found.");
    }
    const next = updater(store.drafts[index]);
    store.drafts[index] = next;
    return next;
  });
}

export async function saveGenerationJob(job: GenerationJob) {
  return mutateStore((store) => {
    const index = store.jobs.findIndex((item) => item.id === job.id);
    if (index >= 0) {
      store.jobs[index] = job;
    } else {
      store.jobs.push(job);
    }
    return job;
  });
}

export async function getGenerationJob(jobId: string) {
  const store = await readStore();
  return store.jobs.find((job) => job.id === jobId);
}

export async function requireGenerationJob(jobId: string) {
  const job = await getGenerationJob(jobId);
  if (!job) {
    throw new SiteCreationError(404, "NOT_FOUND", "The generation job was not found.");
  }
  return job;
}

export async function appendAuditEvent(event: AuditEvent) {
  return mutateStore((store) => {
    store.audit_events.push(event);
    return event;
  });
}

export async function listAuditEvents() {
  const store = await readStore();
  return store.audit_events.sort(
    (left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  );
}

export async function resetSiteCreationStoreForTests(store: SiteCreationStore = emptyStore()) {
  await writeStore(store);
}
