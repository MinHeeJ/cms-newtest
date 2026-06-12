package com.example.cms.attachment;

import com.example.cms.common.ApiResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/attachments")
public class AttachmentController {
    private final AttachmentMapper attachmentMapper;
    private final UploadPolicy uploadPolicy;
    private final StorageService storageService;

    public AttachmentController(AttachmentMapper attachmentMapper, UploadPolicy uploadPolicy, StorageService storageService) {
        this.attachmentMapper = attachmentMapper;
        this.uploadPolicy = uploadPolicy;
        this.storageService = storageService;
    }

    @GetMapping
    public ApiResponse<List<AttachmentResponse>> list(@RequestParam String refType, @RequestParam Long refId) {
        return ApiResponse.ok(attachmentMapper.listActive(refType, refId).stream().map(AttachmentResponse::from).toList());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<List<AttachmentResponse>> upload(
            @RequestParam String refType,
            @RequestParam Long refId,
            @RequestParam("files") MultipartFile[] files) throws IOException {
        uploadPolicy.validate(files);
        List<AttachmentResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            String originalName = uploadPolicy.safeOriginalName(file.getOriginalFilename());
            String extension = uploadPolicy.validate(file);
            String storageKey = storageService.store(file, extension);
            Attachment attachment = new Attachment();
            attachment.setRefType(refType);
            attachment.setRefId(refId);
            attachment.setOriginalName(originalName);
            attachment.setStorageKey(storageKey);
            attachment.setSizeBytes(file.getSize());
            attachment.setContentType(file.getContentType());
            attachment.setExtension(extension);
            attachmentMapper.insertAttachment(attachment);
            responses.add(AttachmentResponse.from(attachmentMapper.findActive(attachment.getId())));
        }
        return ApiResponse.ok(responses);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable Long id) {
        Attachment attachment = required(id);
        Resource resource = storageService.load(attachment.getStorageKey());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(attachment.getOriginalName()).build().toString())
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) throws IOException {
        Attachment attachment = required(id);
        attachmentMapper.markDeleted(id);
        storageService.delete(attachment.getStorageKey());
        return ApiResponse.ok();
    }

    private Attachment required(Long id) {
        Attachment attachment = attachmentMapper.findActive(id);
        if (attachment == null) {
            throw new IllegalArgumentException("첨부파일을 찾을 수 없습니다.");
        }
        return attachment;
    }
}
