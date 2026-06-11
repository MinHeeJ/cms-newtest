package com.example.cms.attachment;

import com.example.cms.config.CmsProperties;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Locale;
import java.util.UUID;

@Service
public class LocalStorageService implements StorageService {

    private final CmsProperties properties;
    private final UploadPolicy uploadPolicy;

    public LocalStorageService(CmsProperties properties, UploadPolicy uploadPolicy) {
        this.properties = properties;
        this.uploadPolicy = uploadPolicy;
    }

    @Override
    public StoredFile store(MultipartFile file) throws IOException {
        uploadPolicy.validate(file);
        String originalName = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String extension = uploadPolicy.extensionOf(originalName);
        String datePath = LocalDate.now().toString().replace("-", "/");
        String storageKey = datePath + "/" + UUID.randomUUID() + "." + extension;
        Path target = uploadPolicy.resolveStorageKey(storageKey);
        Files.createDirectories(target.getParent());
        file.transferTo(target);
        return new StoredFile(
                storageKey,
                originalName,
                file.getSize(),
                file.getContentType() == null ? "application/octet-stream" : file.getContentType().toLowerCase(Locale.ROOT),
                extension
        );
    }

    @Override
    public Resource load(String storageKey) {
        return new FileSystemResource(uploadPolicy.resolveStorageKey(storageKey));
    }

    @Override
    public void delete(String storageKey) {
        try {
            Files.deleteIfExists(uploadPolicy.resolveStorageKey(storageKey));
        } catch (IOException ignored) {
            // Metadata deletion remains authoritative; missing files are handled operationally.
        }
    }
}
