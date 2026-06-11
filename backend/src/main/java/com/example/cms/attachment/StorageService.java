package com.example.cms.attachment;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

public interface StorageService {

    StoredFile store(MultipartFile file) throws IOException;

    Resource load(String storageKey);

    void delete(String storageKey);
}
