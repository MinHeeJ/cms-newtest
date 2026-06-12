package com.example.community.support;

import com.example.community.api.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class SecurityUserContext {
    private static final UUID DEFAULT_MEMBER_ID = UUID.fromString("00000000-0000-0000-0000-000000000101");
    private final HttpServletRequest request;

    public SecurityUserContext(HttpServletRequest request) {
        this.request = request;
    }

    public CurrentUser currentUser() {
        String userIdHeader = request.getHeader("X-User-Id");
        UUID userId = userIdHeader == null || userIdHeader.isBlank()
                ? DEFAULT_MEMBER_ID
                : parseUuid(userIdHeader, "X-User-Id");
        String rolesHeader = request.getHeader("X-User-Role");
        Set<String> roles = rolesHeader == null || rolesHeader.isBlank()
                ? Set.of("MEMBER")
                : Arrays.stream(rolesHeader.split(","))
                        .map(String::trim)
                        .filter(role -> !role.isBlank())
                        .map(String::toUpperCase)
                        .collect(Collectors.toSet());
        return new CurrentUser(userId, roles);
    }

    public CurrentUser requireOperator() {
        CurrentUser user = currentUser();
        if (!user.isOperator()) {
            throw new ErrorResponse.ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "운영자 권한이 필요합니다.");
        }
        return user;
    }

    private UUID parseUuid(String value, String headerName) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException exception) {
            throw new ErrorResponse.ApiException(HttpStatus.BAD_REQUEST, "INVALID_HEADER", headerName + " 값이 올바른 UUID가 아닙니다.");
        }
    }

    public record CurrentUser(UUID userId, Set<String> roles) {
        public boolean isOperator() {
            return roles.contains("OPERATOR") || roles.contains("ADMIN") || roles.contains("SUPER_ADMIN");
        }
    }
}
