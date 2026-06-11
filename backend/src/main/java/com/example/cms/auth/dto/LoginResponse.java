package com.example.cms.auth.dto;

import com.example.cms.auth.UserRoleProfile;

public record LoginResponse(
        String token,
        UserRoleProfile profile
) {
}
