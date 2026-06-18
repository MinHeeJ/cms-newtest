package com.cms.service;
import com.cms.repository.WorkflowEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class AuditService {
    private final WorkflowEventRepository eventRepo;
    private final DtoMapper mapper;
    public Map<String,Object> list(String actorId, String targetType, int page, int pageSize) {
        UUID aId = actorId != null ? UUID.fromString(actorId) : null;
        var r = eventRepo.search(aId, targetType, PageRequest.of(page-1, pageSize));
        return mapper.paged(r.getContent().stream().map(mapper::event).collect(Collectors.toList()), page, pageSize, r.getTotalElements());
    }
}
