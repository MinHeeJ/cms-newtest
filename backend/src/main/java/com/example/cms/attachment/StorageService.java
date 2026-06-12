package com.example.cms.attachment;

import java.io.IOException;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    String store(MultipartFile file, String extension) throws IOException;

    Resource load(String storageKey);

    void delete(String storageKey) throws IOException;
}
