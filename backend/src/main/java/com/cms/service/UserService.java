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

    public Map<String,Object> register(Map<String,Object> body) {
        String email = stringValue(body.get("email")).toLowerCase(Locale.ROOT);
        String displayName = stringValue(body.get("displayName"));

        if (email.isBlank() || !email.contains("@")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "올바른 이메일을 입력해 주세요");
        }
        if (displayName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이름을 입력해 주세요");
        }
        if (userRepo.findByEmail(email).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 가입된 이메일입니다");
        }

        CmsUser user = CmsUser.builder()
            .email(email)
            .displayName(displayName)
            .status("ACTIVE")
            .roles(new HashSet<>(List.of("ADMIN")))
            .createdAt(Instant.now())
            .updatedAt(Instant.now())
            .build();
        return mapper.user(userRepo.save(user));
    }

    private String stringValue(Object value) {
        return value == null ? "" : String.valueOf(value).trim();
    }

    public Map<String,Object> updateRoles(UUID userId, List<String> roles, String reason, CmsUser actor) {
        CmsUser user = userRepo.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.setRoles(new HashSet<>(roles)); user.setUpdatedAt(Instant.now());
        eventRepo.save(WorkflowEvent.builder().eventType("PERMISSION_CHANGE").actor(actor)
            .targetType("USER").targetId(userId).afterState("{\"roles\":\"" + roles + "\"}").build());
        return mapper.user(userRepo.save(user));
    }
}
