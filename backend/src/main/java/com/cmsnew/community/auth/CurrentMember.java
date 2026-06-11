package com.cmsnew.community.auth;

import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.Role;

public record CurrentMember(String id, String email, String nickname, Role role) {
    public static CurrentMember require(CurrentMember currentMember) {
        if (currentMember == null) {
            throw ApiErrorException.unauthorized("로그인이 필요한 요청입니다.");
        }
        return currentMember;
    }
}
