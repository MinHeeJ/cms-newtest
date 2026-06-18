package com.cms.service;
import com.cms.entity.*;
import com.cms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCrypt;
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
    public CmsUser authenticate(String username, String password) {
        String normalizedUsername = normalizeUsername(username);
        CmsUser user = userRepo.findByUsername(normalizedUsername)
            .filter(found -> "ACTIVE".equals(found.getStatus()))
            .filter(found -> passwordMatches(password, found.getPasswordHash()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 확인하세요."));
        user.setLastLoginAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        return userRepo.save(user);
    }
    public CmsUser register(String username, String password, String passwordConfirm) {
        String normalizedUsername = normalizeUsername(username);
        if (normalizedUsername.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "아이디를 입력하세요.");
        }
        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호를 입력하세요.");
        }
        if (!password.equals(passwordConfirm)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "비밀번호 확인이 일치하지 않습니다.");
        }
        String generatedEmail = normalizedUsername + "@local.cms";
        if (userRepo.existsByUsername(normalizedUsername) || userRepo.existsByEmail(generatedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 아이디입니다.");
        }
        Instant now = Instant.now();
        CmsUser user = CmsUser.builder()
            .username(normalizedUsername)
            .email(generatedEmail)
            .passwordHash(BCrypt.hashpw(password, BCrypt.gensalt()))
            .displayName(normalizedUsername)
            .status("ACTIVE")
            .roles(new HashSet<>(Set.of("VIEWER")))
            .createdAt(now)
            .updatedAt(now)
            .build();
        return userRepo.save(user);
    }
    private String normalizeUsername(String username) {
        return Optional.ofNullable(username).orElse("").trim().toLowerCase(Locale.ROOT);
    }
    private boolean passwordMatches(String password, String storedHash) {
        if (password == null || storedHash == null || storedHash.isBlank()) return false;
        if (storedHash.startsWith("{noop}")) return password.equals(storedHash.substring("{noop}".length()));
        try {
            return BCrypt.checkpw(password, storedHash);
        } catch (IllegalArgumentException ignored) {
            return false;
        }
    }

    public Map<String,Object> updateRoles(UUID userId, List<String> roles, String reason, CmsUser actor) {
        CmsUser user = userRepo.findById(userId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.setRoles(new HashSet<>(roles)); user.setUpdatedAt(Instant.now());
        eventRepo.save(WorkflowEvent.builder().eventType("PERMISSION_CHANGE").actor(actor)
            .targetType("USER").targetId(userId).afterState("{\"roles\":\"" + roles + "\"}").build());
        return mapper.user(userRepo.save(user));
    }
}
