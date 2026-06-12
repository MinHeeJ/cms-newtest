package com.example.community.application;

import com.example.community.api.ErrorResponse;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.MediaAsset;
import com.example.community.repository.CommunityCreationRepositories;
import java.util.Set;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class CommunityMediaService {
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of("image/png", "image/jpeg", "image/webp");
    private static final long MAX_BYTES = 5L * 1024L * 1024L;

    private final CommunityCreationRepositories repositories;

    public CommunityMediaService(CommunityCreationRepositories repositories) {
        this.repositories = repositories;
    }

    public MediaAsset attachMetadata(UUID ownerUserId, CommunityCreationRequest request, MediaCommand command) {
        if (!ALLOWED_MIME_TYPES.contains(command.mimeType())) {
            throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "UNSUPPORTED_MEDIA_TYPE", "PNG, JPEG, WebP 이미지만 사용할 수 있습니다.");
        }
        if (command.byteSize() <= 0 || command.byteSize() > MAX_BYTES) {
            throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "MEDIA_TOO_LARGE", "대표 이미지는 5MB 이하만 사용할 수 있습니다.");
        }
        if (command.width() < 400 || command.height() < 240) {
            throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "IMAGE_TOO_SMALL", "대표 이미지는 최소 400x240 이상이어야 합니다.");
        }

        MediaAsset asset = new MediaAsset(
                ownerUserId,
                request,
                command.fileName(),
                command.mimeType(),
                command.byteSize(),
                command.width(),
                command.height());
        repositories.persist(asset);
        request.updateIdentity(null, null, null, null, null, null, null, asset.getId());
        return asset;
    }

    public record MediaCommand(String fileName, String mimeType, long byteSize, int width, int height) {
    }
}
