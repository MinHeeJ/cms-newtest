package com.example.cms.auth;

public record UserRoleProfile(
        String username,
        String displayName,
        String role,
        boolean adminAccess,
        boolean portalAccess,
        String defaultPath
) {

    public static UserRoleProfile admin(String username, String displayName) {
        return new UserRoleProfile(username, displayName, "ADMIN", true, true, "/admin");
    }

    public static UserRoleProfile user(String username, String displayName) {
        return new UserRoleProfile(username, displayName, "USER", false, true, "/portal");
    }
}
