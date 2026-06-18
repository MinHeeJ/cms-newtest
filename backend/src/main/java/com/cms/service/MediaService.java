package com.cms.service;
import com.cms.entity.*;
import com.cms.repository.MediaAssetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
@Service @RequiredArgsConstructor @Transactional
public class MediaService {
    private final MediaAssetRepository repo;
    private final DtoMapper mapper;
    @Transactional(readOnly=true)
    public Map<String,Object> list(int page, int pageSize) {
        Page<MediaAsset> r = repo.findAll(PageRequest.of(page-1, pageSize, Sort.by("createdAt").descending()));
        return mapper.paged(r.getContent().stream().map(mapper::media).collect(java.util.stream.Collectors.toList()), page, pageSize, r.getTotalElements());
    }
    public Map<String,Object> upload(Map<String,Object> input, CmsUser actor) {
        String key = UUID.randomUUID() + "_" + input.getOrDefault("fileName", "upload.bin");
        MediaAsset a = MediaAsset.builder()
            .fileName(input.getOrDefault("fileName","upload.bin").toString())
            .mimeType(input.getOrDefault("mimeType","application/octet-stream").toString())
            .sizeBytes(Long.parseLong(input.getOrDefault("sizeBytes","0").toString()))
            .storageKey(key).altText((String)input.get("altText")).caption((String)input.get("caption"))
            .uploadedBy(actor).usageCount(0).build();
        return mapper.media(repo.save(a));
    }
    public Map<String,Object> update(UUID id, Map<String,Object> input, CmsUser actor) {
        MediaAsset a = repo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (input.containsKey("fileName")) a.setFileName((String)input.get("fileName"));
        if (input.containsKey("altText"))  a.setAltText((String)input.get("altText"));
        if (input.containsKey("caption"))  a.setCaption((String)input.get("caption"));
        a.setUpdatedAt(Instant.now());
        return mapper.media(repo.save(a));
    }
    public void delete(UUID id, boolean confirm) {
        if (!confirm) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "confirm 필요");
        repo.deleteById(id);
    }
}
