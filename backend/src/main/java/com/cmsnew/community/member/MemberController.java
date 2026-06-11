package com.cmsnew.community.member;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cmsnew.community.auth.AuthDtos.MemberProfile;
import com.cmsnew.community.auth.AuthDtos.UpdateMemberRequest;
import com.cmsnew.community.auth.CurrentMember;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.notification.NotificationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users/me")
public class MemberController {
    private final MemberRepository memberRepository;
    private final NotificationService notificationService;

    public MemberController(MemberRepository memberRepository, NotificationService notificationService) {
        this.memberRepository = memberRepository;
        this.notificationService = notificationService;
    }

    @GetMapping
    MemberProfile me(@AuthenticationPrincipal CurrentMember currentMember) {
        CurrentMember current = CurrentMember.require(currentMember);
        Member member = memberRepository.findById(current.id())
                .orElseThrow(() -> ApiErrorException.notFound("회원 정보를 찾을 수 없습니다."));
        return MemberProfile.from(member, notificationService.unreadCount(member.getId()));
    }

    @PatchMapping
    MemberProfile update(@AuthenticationPrincipal CurrentMember currentMember, @Valid @RequestBody UpdateMemberRequest request) {
        CurrentMember current = CurrentMember.require(currentMember);
        Member member = memberRepository.findById(current.id())
                .orElseThrow(() -> ApiErrorException.notFound("회원 정보를 찾을 수 없습니다."));
        String preferences = request.notificationPreferences() == null ? null : request.notificationPreferences().toString();
        member.updateProfile(request.nickname(), request.bio(), preferences);
        memberRepository.save(member);
        return MemberProfile.from(member, notificationService.unreadCount(member.getId()));
    }
}
