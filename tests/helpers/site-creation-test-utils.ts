import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { resetSiteCreationStoreForTests } from "@/server/site-creation/site-draft-repository";

export async function useIsolatedSiteCreationStore() {
  process.env.SITE_CREATION_DATA_FILE = path.join(
    os.tmpdir(),
    `site-creation-${randomUUID()}.json`
  );
  delete process.env.SITE_CREATION_REQUIRE_AUTH;
  await resetSiteCreationStoreForTests();
}
