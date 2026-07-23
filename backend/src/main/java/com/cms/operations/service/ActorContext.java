package com.cms.operations.service;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public record ActorContext(String actorId, String scope, Set<String> roles) {
    public static ActorContext from(HttpServletRequest request) {
        String actorId = headerOrDefault(request, "X-Actor-Id", "system");
        String scope = headerOrDefault(request, "X-Actor-Scope", "ORG-001");
        String roleHeader = headerOrDefault(request, "X-Actor-Role", "ADMIN,STAFF,APPROVER,COLLEGE_MANAGER,CANCEL_MANAGER,OPERATOR,REVIEWER");
        Set<String> roles = Arrays.stream(roleHeader.split(",")).map(String::trim).filter(s -> !s.isBlank()).collect(Collectors.toSet());
        return new ActorContext(actorId, scope, roles);
    }

    public boolean hasRole(String role) {
        return roles.contains("ADMIN") || roles.contains(role);
    }

    private static String headerOrDefault(HttpServletRequest request, String name, String fallback) {
        String value = request.getHeader(name);
        return value == null || value.isBlank() ? fallback : value;
    }
}
