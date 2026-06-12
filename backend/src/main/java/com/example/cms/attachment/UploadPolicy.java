package com.example.cms.attachment;

import com.example.cms.config.CmsProperties;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class UploadPolicy {
    private final long maxFileSizeBytes;
    private final long maxRequestSizeBytes;
    private final Set<String> allowedExtensions;

    public UploadPolicy(CmsProperties properties) {
        this.maxFileSizeBytes = properties.getUpload().getMaxFileSizeBytes();
        this.maxRequestSizeBytes = properties.getUpload().getMaxRequestSizeBytes();
        this.allowedExtensions = properties.getUpload().getAllowedExtensions().stream()
                .map(value -> value.toLowerCase(Locale.ROOT))
                .collect(Collectors.toUnmodifiableSet());
    }

    public void validate(MultipartFile[] files) {
        long totalSize = 0;
        for (MultipartFile file : files) {
            validate(file);
            totalSize += file.getSize();
        }
        if (totalSize > maxRequestSizeBytes) {
            throw new IllegalArgumentException("요청 전체 업로드 크기는 20MB를 초과할 수 없습니다.");
        }
    }

    public String validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 파일을 선택해 주세요.");
        }
        if (file.getSize() > maxFileSizeBytes) {
            throw new IllegalArgumentException("파일당 업로드 크기는 10MB를 초과할 수 없습니다.");
        }
        String originalName = safeOriginalName(file.getOriginalFilename());
        String extension = extension(originalName);
        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("허용되지 않는 파일 확장자입니다.");
        }
        return extension;
    }

    public String safeOriginalName(String originalFilename) {
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("파일명이 올바르지 않습니다.");
        }
        String normalized = Normalizer.normalize(originalFilename, Normalizer.Form.NFC);
        if (normalized.contains("..") || normalized.contains("/") || normalized.contains("\\")) {
            throw new IllegalArgumentException("파일명에 경로 문자를 사용할 수 없습니다.");
        }
        return normalized;
    }

    private String extension(String filename) {
        int index = filename.lastIndexOf('.');
        if (index < 0 || index == filename.length() - 1) {
            throw new IllegalArgumentException("파일 확장자를 확인해 주세요.");
        }
        return filename.substring(index + 1).toLowerCase(Locale.ROOT);
    }
}
