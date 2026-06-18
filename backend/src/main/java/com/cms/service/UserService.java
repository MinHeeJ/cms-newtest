package com.cms.service;
import com.cms.entity.*;
import com.cms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
@Service @RequiredArgsConstructor @Transactional
public class UserService {
    private final UserRepository userRepo;
    private final WorkflowEventRepository eventRepo;
    private final DtoMapper mapper;
    @Transactional(readOnly=true)
    public Map<String,Object> list(int page, int pageSize) {
        Page<CmsUser> r = userRepo.findAll(PageRequest.of(page-1, pageSize));
        return mapper.paged(r.getContent().stream().map(mapper::user).collect(Collectors.toList()), page, pageSize, r.getTotalElements());
    }
    public Map<String,Object> updateRoles(UUID userId, List<String> roles, String reason, CmsUser actor) {
        CmsUser user = userRepo.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.setRoles(new HashSet<>(roles)); user.setUpdatedAt(Instant.now());
        eventRepo.save(WorkflowEvent.builder().eventType("PERMISSION_CHANGE").actor(actor)
            .targetType("USER").targetId(userId).afterState("{\"roles\":\"" + roles + "\"}").build());
        return mapper.user(userRepo.save(user));
    }
}
