package com.cmsnew.community.admin;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.audit.AuditService;
import com.cmsnew.community.auth.AuthDtos.MemberProfile;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.MemberStatus;
import com.cmsnew.community.common.CommunityEnums.Role;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.member.MemberRepository;

@Service
public class RoleManagementService {
    private final MemberRepository memberRepository;
    private final AuditService auditService;

    public RoleManagementService(MemberRepository memberRepository, AuditService auditService) {
        this.memberRepository = memberRepository;
        this.auditService = auditService;
    }

    @Transactional
    public MemberProfile updateRole(String actorId, String memberId, Role role) {
        Member member = member(memberId);
        member.changeRole(role);
        auditService.record(actorId, "ROLE_UPDATE", "MEMBER", memberId, "권한 변경", role.name());
        return MemberProfile.from(member, 0);
    }

    @Transactional
    public MemberProfile updateStatus(String actorId, String memberId, MemberStatus status) {
        Member member = member(memberId);
        member.changeStatus(status);
        auditService.record(actorId, "MEMBER_STATUS_UPDATE", "MEMBER", memberId, "회원 상태 변경", status.name());
        return MemberProfile.from(member, 0);
    }

    private Member member(String memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> ApiErrorException.notFound("회원을 찾을 수 없습니다."));
    }
}
