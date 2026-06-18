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
    public CmsUser authenticateByEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        CmsUser user = userRepo.findByEmail(normalizedEmail)
            .filter(found -> "ACTIVE".equals(found.getStatus()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "등록된 활성 사용자만 로그인할 수 있습니다."));
        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        return userRepo.save(user);
    }

    @Transactional(readOnly=true)
    public Map<String,Object> recoverCredentialsByEmail(String email) {
        String normalizedEmail = normalizeEmail(email);
        CmsUser user = userRepo.findByEmail(normalizedEmail)
            .filter(found -> "ACTIVE".equals(found.getStatus()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "가입 시 입력한 활성 사용자 이메일을 찾을 수 없습니다."));
        return Map.of(
            "loginId", user.getEmail(),
            "displayName", user.getDisplayName(),
            "passwordRecoveryMessage", "비밀번호는 보안상 표시할 수 없습니다. 관리자에게 초기화 요청을 보내세요."
        );
    }

    private String normalizeEmail(String email) {
        return Optional.ofNullable(email).orElse("").trim().toLowerCase(Locale.ROOT);
    }

    public Map<String,Object> updateRoles(UUID userId, List<String> roles, String reason, CmsUser actor) {
        CmsUser user = userRepo.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.setRoles(new HashSet<>(roles)); user.setUpdatedAt(Instant.now());
        eventRepo.save(WorkflowEvent.builder().eventType("PERMISSION_CHANGE").actor(actor)
            .targetType("USER").targetId(userId).afterState("{\"roles\":\"" + roles + "\"}").build());
        return mapper.user(userRepo.save(user));
    }
}
