import { forbidden, notFound, validationError } from "../../api/middleware/error-handler.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { hasPermission } from "../auth/permissions.js";
import type { MediaAsset, User } from "../content/content.types.js";
import { mediaRepository } from "./media.repository.js";
import { storageClient } from "./storage.client.js";

const allowedMimePrefixes = ["image/", "application/pdf", "text/plain"];
const maxSizeBytes = 20 * 1024 * 1024;

export class MediaService {
  list(query: { q?: string; mimeType?: string; page?: number; pageSize?: number }) {
    return mediaRepository.list(query);
  }

  async upload(input: { fileName: string; mimeType: string; sizeBytes: number; altText?: string | null; caption?: string | null }, user: User): Promise<MediaAsset> {
    if (!hasPermission(user, "media:manage")) {
      throw forbidden();
    }
    if (!allowedMimePrefixes.some((prefix) => input.mimeType.startsWith(prefix))) {
      throw validationError("허용되지 않는 파일 형식입니다.");
    }
    if (input.sizeBytes > maxSizeBytes) {
      throw validationError("파일 크기가 허용 범위를 초과했습니다.");
    }
    if (input.mimeType.startsWith("image/") && !input.altText?.trim()) {
      throw validationError("공개 이미지에는 대체 텍스트가 필요합니다.");
    }

    const stored = await storageClient.putObject(input);
    const asset = mediaRepository.create(
      {
        ...input,
        storageKey: stored.storageKey,
        url: stored.publicUrl
      },
      user
    );
    workflowEventService.write({
      eventType: "CREATE",
      actor: user,
      targetType: "MediaAsset",
      targetId: asset.id,
      afterState: { fileName: asset.fileName, mimeType: asset.mimeType }
    });
    return asset;
  }

  update(mediaId: string, input: { fileName?: string; altText?: string | null; caption?: string | null }, user: User): MediaAsset {
    if (!hasPermission(user, "media:manage")) {
      throw forbidden();
    }
    const asset = mediaRepository.find(mediaId);
    if (!asset) {
      throw notFound("미디어를 찾을 수 없습니다.");
    }
    const beforeState = { fileName: asset.fileName, altText: asset.altText, caption: asset.caption };
    const updated = mediaRepository.update(asset, input);
    workflowEventService.write({
      eventType: "UPDATE",
      actor: user,
      targetType: "MediaAsset",
      targetId: asset.id,
      beforeState,
      afterState: { fileName: updated.fileName, altText: updated.altText, caption: updated.caption }
    });
    return updated;
  }

  async delete(mediaId: string, confirm: boolean, user: User): Promise<void> {
    if (!hasPermission(user, "media:manage")) {
      throw forbidden();
    }
    const asset = mediaRepository.find(mediaId);
    if (!asset) {
      throw notFound("미디어를 찾을 수 없습니다.");
    }
    if (asset.usageCount > 0 && !confirm) {
      throw validationError(`이 미디어를 사용하는 콘텐츠 ${asset.usageCount}건이 있습니다.`);
    }
    await storageClient.removeObject(asset.storageKey);
    mediaRepository.delete(asset);
    workflowEventService.write({
      eventType: "DELETE",
      actor: user,
      targetType: "MediaAsset",
      targetId: asset.id,
      beforeState: { fileName: asset.fileName, usageCount: asset.usageCount }
    });
  }
}

export const mediaService = new MediaService();
