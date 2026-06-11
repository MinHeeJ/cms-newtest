package com.cmsnew.community.auth;

import java.util.Locale;
import java.util.Set;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.audit.AuditService;
import com.cmsnew.community.auth.AuthDtos.AuthSession;
import com.cmsnew.community.auth.AuthDtos.LoginRequest;
import com.cmsnew.community.auth.AuthDtos.MemberProfile;
import com.cmsnew.community.auth.AuthDtos.RegisterRequest;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.MemberStatus;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.member.MemberRepository;

@Service
public class AuthService {
    private static final Set<String> RESERVED_NICKNAMES = Set.of("admin", "administrator", "운영자", "관리자", "스태프");

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AuthService(MemberRepository memberRepository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @Transactional
    public AuthSession register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String nickname = request.nickname().trim();
        validateNickname(nickname);
        if (memberRepository.existsByEmail(email)) {
            throw ApiErrorException.conflict("이미 가입된 이메일입니다.");
        }
        if (memberRepository.existsByNickname(nickname)) {
            throw ApiErrorException.conflict("이미 사용 중인 닉네임입니다.");
        }

        Member member = memberRepository.save(new Member(email, passwordEncoder.encode(request.password()), nickname));
        auditService.record(member.getId(), "AUTH_REGISTER", "MEMBER", member.getId(), "회원가입이 완료되었습니다.", null);
        return new AuthSession(tokenFor(member), MemberProfile.from(member, 0));
    }

    @Transactional
    public AuthSession login(LoginRequest request) {
        Member member = memberRepository.findByEmail(request.email().trim().toLowerCase(Locale.ROOT))
                .orElseThrow(() -> ApiErrorException.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다."));
        if (!passwordEncoder.matches(request.password(), member.getPasswordHash())) {
            throw ApiErrorException.unauthorized("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
        if (member.getStatus() == MemberStatus.SUSPENDED || member.getStatus() == MemberStatus.WITHDRAWN) {
            throw ApiErrorException.forbidden("현재 계정 상태로는 로그인할 수 없습니다.");
        }
        member.markLoggedIn();
        auditService.record(member.getId(), "AUTH_LOGIN", "MEMBER", member.getId(), "로그인 성공", null);
        return new AuthSession(tokenFor(member), MemberProfile.from(member, 0));
    }

    public String tokenFor(Member member) {
        return "cms-token:" + member.getId() + ":" + member.getRole().name();
    }

    private void validateNickname(String nickname) {
        String normalized = nickname.toLowerCase(Locale.ROOT);
        if (RESERVED_NICKNAMES.contains(normalized) || nickname.contains("운영자") || nickname.contains("관리자")) {
            throw ApiErrorException.badRequest("운영자 또는 관리자와 혼동되는 닉네임은 사용할 수 없습니다.");
        }
    }
}
