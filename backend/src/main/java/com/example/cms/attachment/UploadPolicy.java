package com.example.cms.attachment;

import com.example.cms.config.CmsProperties;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UploadPolicy {

    private final CmsProperties properties;
    private final Path basePath;
    private final Set<String> allowedExtensions;

    public UploadPolicy(CmsProperties properties) {
        this.properties = properties;
        this.basePath = Path.of(properties.getUpload().getBasePath()).toAbsolutePath().normalize();
        this.allowedExtensions = properties.getUpload().getAllowedExtensions().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
    }

    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일을 선택해 주세요.");
        }
        if (file.getSize() > properties.getUpload().getMaxFileBytes()) {
            throw new IllegalArgumentException("파일은 10MB 이하만 업로드할 수 있습니다.");
        }
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "" : file.getOriginalFilename());
        if (originalName.contains("..") || originalName.contains("/") || originalName.contains("\\")) {
            throw new IllegalArgumentException("파일명이 올바르지 않습니다.");
        }
        String extension = extensionOf(originalName);
        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다.");
        }
    }

    public String extensionOf(String filename) {
        String extension = StringUtils.getFilenameExtension(filename);
        if (extension == null || extension.isBlank()) {
            throw new IllegalArgumentException("파일 확장자를 확인할 수 없습니다.");
        }
        return extension.toLowerCase(Locale.ROOT);
    }

    public Path resolveStorageKey(String storageKey) {
        Path target = basePath.resolve(storageKey).normalize();
        if (!target.startsWith(basePath)) {
            throw new IllegalArgumentException("저장 경로가 올바르지 않습니다.");
        }
        return target;
    }
}
