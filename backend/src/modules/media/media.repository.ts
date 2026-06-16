import { createId, getDataStore, paginate, timestamp } from "../../persistence/database.js";
import type { MediaAsset, User } from "../content/content.types.js";

export interface MediaCreateInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storageKey: string;
  url: string;
  altText?: string | null;
  caption?: string | null;
}

export class MediaRepository {
  list(query: { q?: string; mimeType?: string; page?: number; pageSize?: number }) {
    const q = query.q?.toLowerCase();
    const items = getDataStore().mediaAssets.filter((asset) => {
      const searchable = `${asset.fileName} ${asset.altText ?? ""} ${asset.caption ?? ""}`.toLowerCase();
      return (!q || searchable.includes(q)) && (!query.mimeType || asset.mimeType.includes(query.mimeType));
    });
    return paginate(items, query.page, query.pageSize);
  }

  find(mediaId: string): MediaAsset | undefined {
    return getDataStore().mediaAssets.find((asset) => asset.id === mediaId);
  }

  create(input: MediaCreateInput, user: User): MediaAsset {
    const createdAt = timestamp();
    const asset: MediaAsset = {
      id: createId(),
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storageKey: input.storageKey,
      url: input.url,
      altText: input.altText ?? null,
      caption: input.caption ?? null,
      usageCount: 0,
      uploadedBy: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      },
      createdAt,
      updatedAt: createdAt
    };
    getDataStore().mediaAssets.unshift(asset);
    return asset;
  }

  update(asset: MediaAsset, input: { fileName?: string; altText?: string | null; caption?: string | null }): MediaAsset {
    asset.fileName = input.fileName ?? asset.fileName;
    asset.altText = input.altText ?? asset.altText;
    asset.caption = input.caption ?? asset.caption;
    asset.updatedAt = timestamp();
    return asset;
  }

  delete(asset: MediaAsset): void {
    const store = getDataStore();
    store.mediaAssets = store.mediaAssets.filter((candidate) => candidate.id !== asset.id);
  }
}

export const mediaRepository = new MediaRepository();
