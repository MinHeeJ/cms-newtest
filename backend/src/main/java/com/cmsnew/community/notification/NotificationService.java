package com.cmsnew.community.notification;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cmsnew.community.comment.Comment;
import com.cmsnew.community.common.ApiErrorException;
import com.cmsnew.community.common.CommunityEnums.NotificationType;
import com.cmsnew.community.common.PageResponse;
import com.cmsnew.community.member.Member;
import com.cmsnew.community.member.MemberRepository;
import com.cmsnew.community.notification.NotificationDtos.NotificationResponse;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final MemberRepository memberRepository;

    public NotificationService(NotificationRepository notificationRepository, MemberRepository memberRepository) {
        this.notificationRepository = notificationRepository;
        this.memberRepository = memberRepository;
    }

    @Transactional
    public void notifyForComment(Comment comment) {
        Member recipient;
        NotificationType type;
        String title;
        if (comment.getParentComment() != null) {
            recipient = comment.getParentComment().getAuthor();
            type = NotificationType.REPLY;
            title = "내 댓글에 답글이 달렸습니다.";
        } else {
            recipient = comment.getPost().getAuthor();
            type = NotificationType.COMMENT_ON_POST;
            title = "내 글에 댓글이 달렸습니다.";
        }
        if (recipient.getId().equals(comment.getAuthor().getId())) {
            return;
        }
        notificationRepository.save(new Notification(
                recipient,
                type,
                title,
                comment.getAuthor().getNickname() + "님의 새 댓글을 확인해보세요.",
                "POST",
                comment.getPost().getId()
        ));
    }

    @Transactional
    public void notifyModerationResult(String recipientId, String targetType, String targetId, String message) {
        Member recipient = memberRepository.findById(recipientId)
                .orElseThrow(() -> ApiErrorException.notFound("알림 대상 회원을 찾을 수 없습니다."));
        notificationRepository.save(new Notification(
                recipient,
                NotificationType.MODERATION_RESULT,
                "운영 조치 결과",
                message,
                targetType,
                targetId
        ));
    }

    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> list(String memberId, boolean unreadOnly, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (unreadOnly) {
            return PageResponse.from(notificationRepository.findByRecipient_IdAndReadAtIsNullOrderByCreatedAtDesc(memberId, pageable)
                    .map(NotificationResponse::from));
        }
        return PageResponse.from(notificationRepository.findByRecipient_IdOrderByCreatedAtDesc(memberId, pageable)
                .map(NotificationResponse::from));
    }

    @Transactional
    public void markRead(String memberId, String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiErrorException.notFound("알림을 찾을 수 없습니다."));
        if (!notification.getRecipient().getId().equals(memberId)) {
            throw ApiErrorException.forbidden("내 알림만 읽음 처리할 수 있습니다.");
        }
        notification.markRead();
    }

    public long unreadCount(String memberId) {
        return notificationRepository.countByRecipient_IdAndReadAtIsNull(memberId);
    }
}
