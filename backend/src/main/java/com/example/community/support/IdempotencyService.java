package com.example.community.support;

import com.example.community.api.ErrorResponse;
import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.CommunityTypes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class IdempotencyService {
    public void requireValidKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.length() < 16 || idempotencyKey.length() > 128) {
            throw new ErrorResponse.ApiException(
                    HttpStatus.BAD_REQUEST,
                    "INVALID_IDEMPOTENCY_KEY",
                    "Idempotency-Key는 16자 이상 128자 이하로 전달해야 합니다.");
        }
    }

    public boolean isReplay(CommunityCreationRequest request, String idempotencyKey) {
        return idempotencyKey.equals(request.getIdempotencyKey())
                && (request.getStatus() == CommunityTypes.CreationRequestStatus.LAUNCHED
                        || request.getStatus() == CommunityTypes.CreationRequestStatus.PENDING_REVIEW
                        || request.getStatus() == CommunityTypes.CreationRequestStatus.APPROVED);
    }

    public void rejectConflictingReplay(CommunityCreationRequest request, String idempotencyKey) {
        if (request.getIdempotencyKey() != null && !request.getIdempotencyKey().equals(idempotencyKey)) {
            throw new ErrorResponse.ApiException(
                    HttpStatus.CONFLICT,
                    "IDEMPOTENCY_KEY_CONFLICT",
                    "이미 다른 Idempotency-Key로 제출된 요청입니다.");
        }
    }
}
