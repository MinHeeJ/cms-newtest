package com.cms.service;
import com.cms.entity.CmsUser;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;
@Service
public class PermissionService {
    private static final Map<String, List<String>> PERMS = new HashMap<>();
    static {
        PERMS.put("ADMIN", List.of("content:create","content:edit:own","content:edit:any","content:submit",
            "content:review","content:publish","content:archive","media:manage","media:read",
            "taxonomy:manage","taxonomy:read","navigation:manage","navigation:read",
            "users:manage","audit:read","dashboard:read"));
        PERMS.put("EDITOR", List.of("content:create","content:edit:own","content:edit:any","content:submit",
            "content:review","content:publish","content:archive","media:manage","media:read",
            "taxonomy:manage","taxonomy:read","navigation:manage","navigation:read","audit:read","dashboard:read"));
        PERMS.put("AUTHOR", List.of("content:create","content:edit:own","content:submit","media:manage","media:read"));
        PERMS.put("VIEWER", List.of("media:read","taxonomy:read","navigation:read","dashboard:read"));
    }
    public List<String> getPermissions(CmsUser user) {
        return user.getRoles().stream()
            .flatMap(r -> PERMS.getOrDefault(r, List.of()).stream())
            .distinct().sorted().collect(Collectors.toList());
    }
}
