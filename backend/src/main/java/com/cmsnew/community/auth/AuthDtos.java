package com.cmsnew.community.auth;

import java.util.Map;

import com.cmsnew.community.common.CommunityEnums.MemberStatus;
import com.cmsnew.community.common.CommunityEnums.Role;
import com.cmsnew.community.member.Member;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(
            @Email(message = "올바른 이메일 주소를 입력해주세요.") @NotBlank(message = "이메일은 필수입니다.") String email,
            @Size(min = 10, message = "비밀번호는 10자 이상이어야 합니다.") String password,
            @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하로 입력해주세요.") String nickname
    ) {
    }

    public record LoginRequest(
            @Email(message = "올바른 이메일 주소를 입력해주세요.") @NotBlank(message = "이메일은 필수입니다.") String email,
            @NotBlank(message = "비밀번호는 필수입니다.") String password
    ) {
    }

    public record AuthSession(String accessToken, MemberProfile member) {
    }

    public record UpdateMemberRequest(
            @Size(min = 2, max = 20, message = "닉네임은 2자 이상 20자 이하로 입력해주세요.") String nickname,
            @Size(max = 500, message = "자기소개는 500자 이하로 입력해주세요.") String bio,
            Map<String, Boolean> notificationPreferences
    ) {
    }

    public record MemberProfile(
            String id,
            String email,
            String nickname,
            Role role,
            MemberStatus status,
            String profileImageUrl,
            String bio,
            long unreadNotificationCount
    ) {
        public static MemberProfile from(Member member, long unreadNotificationCount) {
            return new MemberProfile(
                    member.getId(),
                    member.getEmail(),
                    member.getNickname(),
                    member.getRole(),
                    member.getStatus(),
                    member.getProfileImageUrl(),
                    member.getBio(),
                    unreadNotificationCount
            );
        }
    }
}
