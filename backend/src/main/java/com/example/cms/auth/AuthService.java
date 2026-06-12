package com.example.cms.auth;

import com.example.cms.auth.dto.LoginRequest;
import com.example.cms.auth.dto.LoginResponse;
import com.example.cms.auth.dto.UserRoleProfile;
import com.example.cms.security.JwtTokenProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserMapper userMapper, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userMapper.findActiveByUsername(request.username());
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호를 확인해 주세요.");
        }
        UserRoleProfile profile = UserRoleProfile.of(user.getUsername(), user.getDisplayName(), user.getRole());
        return new LoginResponse(tokenProvider.createToken(user.getUsername(), user.getRole()), profile);
    }

    public UserRoleProfile screenContext(Authentication authentication) {
        User user = userMapper.findActiveByUsername(authentication.getName());
        if (user == null) {
            throw new IllegalArgumentException("사용자 정보를 찾을 수 없습니다.");
        }
        return UserRoleProfile.of(user.getUsername(), user.getDisplayName(), user.getRole());
    }
}
