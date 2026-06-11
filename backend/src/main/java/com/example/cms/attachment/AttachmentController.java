package com.example.cms.attachment;

import com.example.cms.attachment.dto.AttachmentResponse;
import com.example.cms.common.ApiResponse;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attachments")
public class AttachmentController {

    private final AttachmentMapper attachmentMapper;
    private final StorageService storageService;

    public AttachmentController(AttachmentMapper attachmentMapper, StorageService storageService) {
        this.attachmentMapper = attachmentMapper;
        this.storageService = storageService;
    }

    @GetMapping
    public ApiResponse<List<AttachmentResponse>> list() {
        return ApiResponse.ok(attachmentMapper.findAllActive().stream().map(AttachmentResponse::from).toList());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<AttachmentResponse> upload(@RequestPart("file") MultipartFile file) throws IOException {
        StoredFile storedFile = storageService.store(file);
        Attachment attachment = new Attachment();
        attachment.setOriginalName(storedFile.originalName());
        attachment.setStorageKey(storedFile.storageKey());
        attachment.setSizeBytes(storedFile.sizeBytes());
        attachment.setContentType(storedFile.contentType());
        attachment.setExtension(storedFile.extension());
        attachmentMapper.insert(attachment);
        return ApiResponse.ok(AttachmentResponse.from(attachmentMapper.findById(attachment.getId())), "파일이 업로드되었습니다.");
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Attachment attachment = attachmentMapper.findById(id);
        if (attachment == null) {
            throw new IllegalArgumentException("첨부파일을 찾을 수 없습니다.");
        }
        Resource resource = storageService.load(attachment.getStorageKey());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment()
                        .filename(attachment.getOriginalName(), StandardCharsets.UTF_8)
                        .build()
                        .toString())
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        Attachment attachment = attachmentMapper.findById(id);
        if (attachment == null) {
            throw new IllegalArgumentException("첨부파일을 찾을 수 없습니다.");
        }
        attachmentMapper.softDelete(id);
        storageService.delete(attachment.getStorageKey());
        return ApiResponse.ok(null, "첨부파일이 삭제되었습니다.");
    }
}
