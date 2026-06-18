package com.cms.service;
import com.cms.entity.*;
import com.cms.repository.TaxonomyTermRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Transactional
public class TaxonomyService {
    private final TaxonomyTermRepository repo;
    private final DtoMapper mapper;
    @Transactional(readOnly=true)
    public List<Map<String,Object>> list(String type) {
        return (type != null ? repo.findByType(type) : repo.findAll())
            .stream().map(mapper::taxonomy).collect(Collectors.toList());
    }
    public Map<String,Object> save(Map<String,Object> input, UUID existingId) {
        TaxonomyTerm t = existingId != null
            ? repo.findById(existingId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND))
            : new TaxonomyTerm();
        String slug = (String) input.get("slug");
        if (existingId == null && repo.existsBySlug(slug))
            throw new ResponseStatusException(HttpStatus.CONFLICT, "slug 중복");
        t.setType((String)input.get("type")); t.setName((String)input.get("name")); t.setSlug(slug);
        t.setDescription((String)input.get("description")); t.setUpdatedAt(Instant.now());
        if (input.get("parentId") != null) t.setParentId(UUID.fromString(input.get("parentId").toString()));
        if (input.get("sortOrder") != null) t.setSortOrder(Integer.parseInt(input.get("sortOrder").toString()));
        return mapper.taxonomy(repo.save(t));
    }
    public void delete(UUID id, boolean confirm) {
        if (!confirm) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "confirm 필요");
        repo.deleteById(id);
    }
}
