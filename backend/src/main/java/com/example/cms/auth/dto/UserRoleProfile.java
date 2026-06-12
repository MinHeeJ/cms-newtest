package com.example.cms.auth.dto;

public record UserRoleProfile(
        String username,
        String displayName,
        String role,
        boolean adminAccess,
        boolean portalAccess,
        String defaultRoute) {
    public static UserRoleProfile of(String username, String displayName, String role) {
        boolean admin = "ADMIN".equals(role);
        return new UserRoleProfile(username, displayName, role, admin, true, admin ? "/admin" : "/portal");
    }
}
