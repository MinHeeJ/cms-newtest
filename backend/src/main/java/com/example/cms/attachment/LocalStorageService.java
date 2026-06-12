package com.example.cms.attachment;

import com.example.cms.config.CmsProperties;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LocalStorageService implements StorageService {
    private final Path basePath;

    public LocalStorageService(CmsProperties properties) {
        this.basePath = Path.of(properties.getUpload().getBasePath()).toAbsolutePath().normalize();
    }

    @Override
    public String store(MultipartFile file, String extension) throws IOException {
        LocalDate today = LocalDate.now();
        String storageKey = today.getYear() + "/" + two(today.getMonthValue()) + "/" + UUID.randomUUID() + "." + extension;
        Path target = resolveSafe(storageKey);
        Files.createDirectories(target.getParent());
        file.transferTo(target);
        return storageKey;
    }

    @Override
    public Resource load(String storageKey) {
        return new PathResource(resolveSafe(storageKey));
    }

    @Override
    public void delete(String storageKey) throws IOException {
        Files.deleteIfExists(resolveSafe(storageKey));
    }

    private Path resolveSafe(String storageKey) {
        Path target = basePath.resolve(storageKey).normalize();
        if (!target.startsWith(basePath)) {
            throw new IllegalArgumentException("허용되지 않는 파일 경로입니다.");
        }
        return target;
    }

    private String two(int value) {
        return value < 10 ? "0" + value : String.valueOf(value);
    }
}
