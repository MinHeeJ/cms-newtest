import { notFound } from "next/navigation";
import { getDomainCatalog } from "@/server/site-creation/domain-catalog";
import { getSiteDraft } from "@/server/site-creation/site-draft-repository";
import { DraftReviewClient } from "../components/draft-review-client";

export const dynamic = "force-dynamic";

export default async function DraftReviewPage({ params }: { params: Promise<{ draftId: string }> }) {
  const { draftId } = await params;
  const draft = await getSiteDraft(draftId);

  if (!draft) {
    notFound();
  }

  return <DraftReviewClient domains={getDomainCatalog()} initialDraft={draft} />;
}
