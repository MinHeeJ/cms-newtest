import { createId, getDataStore, paginate, timestamp } from "../../persistence/database.js";
import type {
  ContentCreateInput,
  ContentItem,
  ContentStatus,
  ContentType,
  ContentUpdateInput,
  TaxonomyTerm,
  User,
  Visibility
} from "./content.types.js";

export interface ContentQuery {
  page?: number;
  pageSize?: number;
  q?: string;
  status?: ContentStatus;
  contentType?: ContentType;
  authorId?: string;
  categoryId?: string;
  tagId?: string;
  updatedFrom?: string;
  updatedTo?: string;
  sort?: "updatedAt" | "publishedAt" | "title" | "status";
  direction?: "asc" | "desc";
}

function pickTerms(ids: string[], type: TaxonomyTerm["type"]): TaxonomyTerm[] {
  return getDataStore().taxonomyTerms.filter((term) => term.type === type && ids.includes(term.id));
}

function pickFeaturedMedia(featuredMediaId: string | null | undefined) {
  if (!featuredMediaId) {
    return null;
  }

  return getDataStore().mediaAssets.find((asset) => asset.id === featuredMediaId) ?? null;
}

export class ContentRepository {
  create(input: ContentCreateInput, author: User): ContentItem {
    const createdAt = timestamp();
    const content: ContentItem = {
      id: createId(),
      contentType: input.contentType,
      title: input.title,
      slug: input.slug,
      status: "DRAFT",
      author: {
        id: author.id,
        email: author.email,
        displayName: author.displayName
      },
      publishedAt: null,
      scheduledAt: null,
      updatedAt: createdAt,
      summary: input.summary ?? "",
      markdownBody: input.markdownBody,
      visibility: input.visibility ?? "PUBLIC",
      featuredMedia: pickFeaturedMedia(input.featuredMediaId),
      categories: pickTerms(input.categoryIds ?? [], "CATEGORY"),
      tags: pickTerms(input.tagIds ?? [], "TAG"),
      revisionsCount: 0,
      createdAt,
      archivedAt: null
    };

    getDataStore().contentItems.unshift(content);
    return content;
  }

  update(content: ContentItem, input: ContentUpdateInput): ContentItem {
    content.contentType = input.contentType;
    content.title = input.title;
    content.slug = input.slug;
    content.summary = input.summary ?? "";
    content.markdownBody = input.markdownBody;
    content.visibility = (input.visibility ?? "PUBLIC") as Visibility;
    content.featuredMedia = pickFeaturedMedia(input.featuredMediaId);
    content.categories = pickTerms(input.categoryIds ?? [], "CATEGORY");
    content.tags = pickTerms(input.tagIds ?? [], "TAG");
    content.updatedAt = timestamp();
    return content;
  }

  save(content: ContentItem): ContentItem {
    content.updatedAt = timestamp();
    return content;
  }

  findById(contentId: string): ContentItem | undefined {
    return getDataStore().contentItems.find((content) => content.id === contentId);
  }

  findBySlug(slug: string): ContentItem | undefined {
    return getDataStore().contentItems.find((content) => content.slug === slug && content.status !== "ARCHIVED");
  }

  list(query: ContentQuery) {
    const q = query.q?.trim().toLowerCase();
    const updatedFrom = query.updatedFrom ? new Date(query.updatedFrom).getTime() : Number.NEGATIVE_INFINITY;
    const updatedTo = query.updatedTo ? new Date(query.updatedTo).getTime() : Number.POSITIVE_INFINITY;

    const filtered = getDataStore().contentItems.filter((content) => {
      const updatedAt = new Date(content.updatedAt).getTime();
      const searchable = `${content.title} ${content.slug} ${content.summary} ${content.markdownBody}`.toLowerCase();
      return (
        (!q || searchable.includes(q)) &&
        (!query.status || content.status === query.status) &&
        (!query.contentType || content.contentType === query.contentType) &&
        (!query.authorId || content.author.id === query.authorId) &&
        (!query.categoryId || content.categories.some((category) => category.id === query.categoryId)) &&
        (!query.tagId || content.tags.some((tag) => tag.id === query.tagId)) &&
        updatedAt >= updatedFrom &&
        updatedAt <= updatedTo
      );
    });

    const sort = query.sort ?? "updatedAt";
    const direction = query.direction ?? "desc";
    filtered.sort((left, right) => {
      const leftValue = left[sort] ?? "";
      const rightValue = right[sort] ?? "";
      const comparison = String(leftValue).localeCompare(String(rightValue));
      return direction === "asc" ? comparison : comparison * -1;
    });

    return paginate(filtered, query.page, query.pageSize);
  }
}

export const contentRepository = new ContentRepository();
