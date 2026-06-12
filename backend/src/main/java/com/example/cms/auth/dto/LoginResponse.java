package com.example.cms.auth.dto;

public record LoginResponse(String accessToken, UserRoleProfile profile) {
}
