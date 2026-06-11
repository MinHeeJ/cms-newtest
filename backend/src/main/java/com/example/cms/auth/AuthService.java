package com.example.cms.auth;

import com.example.cms.auth.dto.LoginRequest;
import com.example.cms.auth.dto.LoginResponse;
import com.example.cms.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthService {

    private final JwtTokenProvider tokenProvider;
    private final Map<String, DemoUser> users;

    public AuthService(JwtTokenProvider tokenProvider, PasswordEncoder passwordEncoder) {
        this.tokenProvider = tokenProvider;
        this.users = Map.of(
                "admin", new DemoUser("admin", "관리자", "ADMIN", passwordEncoder.encode("admin123")),
                "user", new DemoUser("user", "포털 사용자", "USER", passwordEncoder.encode("user123"))
        );
    }

    public LoginResponse login(LoginRequest request, PasswordEncoder passwordEncoder) {
        DemoUser user = users.get(request.username());
        if (user == null || !passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        UserRoleProfile profile = profile(user.username(), user.role());
        return new LoginResponse(tokenProvider.createToken(user.username(), user.role()), profile);
    }

    public UserRoleProfile profile(String username, String role) {
        if ("ADMIN".equals(role)) {
            return UserRoleProfile.admin(username, displayName(username));
        }
        return UserRoleProfile.user(username, displayName(username));
    }

    private String displayName(String username) {
        DemoUser demoUser = users.get(username);
        return demoUser == null ? username : demoUser.displayName();
    }

    private record DemoUser(String username, String displayName, String role, String passwordHash) {
    }
}
