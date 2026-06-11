package com.cmsnew.community.notification;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cmsnew.community.auth.CurrentMember;
import com.cmsnew.community.common.PageResponse;
import com.cmsnew.community.notification.NotificationDtos.NotificationResponse;

@RestController
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/api/v1/notifications")
    PageResponse<NotificationResponse> notifications(@AuthenticationPrincipal CurrentMember currentMember,
                                                     @RequestParam(defaultValue = "false") boolean unreadOnly,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        CurrentMember current = CurrentMember.require(currentMember);
        return notificationService.list(current.id(), unreadOnly, page, size);
    }

    @PatchMapping("/api/v1/notifications/{notificationId}/read")
    ResponseEntity<Void> markRead(@AuthenticationPrincipal CurrentMember currentMember, @PathVariable String notificationId) {
        CurrentMember current = CurrentMember.require(currentMember);
        notificationService.markRead(current.id(), notificationId);
        return ResponseEntity.noContent().build();
    }
}
