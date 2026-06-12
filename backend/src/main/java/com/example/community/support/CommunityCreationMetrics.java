package com.example.community.support;

import com.example.community.domain.CommunityTypes;
import java.util.concurrent.atomic.LongAdder;
import org.springframework.stereotype.Component;

@Component
public class CommunityCreationMetrics {
    private final LongAdder launched = new LongAdder();
    private final LongAdder pendingReview = new LongAdder();
    private final LongAdder rejected = new LongAdder();
    private final LongAdder changeRequested = new LongAdder();

    public void recordRequestStatus(CommunityTypes.CreationRequestStatus status) {
        if (status == CommunityTypes.CreationRequestStatus.LAUNCHED) {
            launched.increment();
        } else if (status == CommunityTypes.CreationRequestStatus.PENDING_REVIEW) {
            pendingReview.increment();
        } else if (status == CommunityTypes.CreationRequestStatus.REJECTED) {
            rejected.increment();
        } else if (status == CommunityTypes.CreationRequestStatus.CHANGE_REQUESTED) {
            changeRequested.increment();
        }
    }

    public Snapshot snapshot() {
        return new Snapshot(launched.sum(), pendingReview.sum(), rejected.sum(), changeRequested.sum());
    }

    public record Snapshot(long launched, long pendingReview, long rejected, long changeRequested) {
    }
}
