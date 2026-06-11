package com.example.cms.auth;

import com.example.cms.common.ApiResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/me")
public class ScreenContextController {

    private final AuthService authService;

    public ScreenContextController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/screen-context")
    public ApiResponse<UserRoleProfile> screenContext(Authentication authentication) {
        String role = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(authority -> authority.startsWith("ROLE_"))
                .map(authority -> authority.substring(5))
                .findFirst()
                .orElse("USER");
        return ApiResponse.ok(authService.profile(authentication.getName(), role));
    }
}
