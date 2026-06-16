import { createId, getDataStore, timestamp } from "../../persistence/database.js";
import type { ContentItem, ContentRevision, User } from "./content.types.js";

export class RevisionRepository {
  listByContent(contentItemId: string): ContentRevision[] {
    return getDataStore().revisions
      .filter((revision) => revision.contentItemId === contentItemId)
      .sort((a, b) => b.revisionNumber - a.revisionNumber);
  }

  latestNumber(contentItemId: string): number {
    return this.listByContent(contentItemId)[0]?.revisionNumber ?? 0;
  }

  find(contentItemId: string, revisionId: string): ContentRevision | undefined {
    return getDataStore().revisions.find((revision) => revision.contentItemId === contentItemId && revision.id === revisionId);
  }

  create(content: ContentItem, user: User, changeSummary?: string): ContentRevision {
    const revision: ContentRevision = {
      id: createId(),
      contentItemId: content.id,
      revisionNumber: this.latestNumber(content.id) + 1,
      titleSnapshot: content.title,
      metadataSnapshot: {
        contentType: content.contentType,
        summary: content.summary,
        slug: content.slug,
        visibility: content.visibility,
        status: content.status,
        featuredMediaId: content.featuredMedia?.id ?? null,
        categoryIds: content.categories.map((category) => category.id),
        tagIds: content.tags.map((tag) => tag.id)
      },
      markdownBodySnapshot: content.markdownBody,
      changeSummary,
      createdBy: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      },
      createdAt: timestamp()
    };

    getDataStore().revisions.push(revision);
    content.revisionsCount = revision.revisionNumber;
    return revision;
  }
}

export const revisionRepository = new RevisionRepository();
