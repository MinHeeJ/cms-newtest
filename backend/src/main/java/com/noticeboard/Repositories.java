package com.noticeboard;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

interface UserRepository extends JpaRepository<AppUser, Long> {
  Optional<AppUser> findByEmail(String email);
  boolean existsByEmail(String email);
  @Query("select u from AppUser u where lower(u.email) like lower(concat('%', :keyword, '%')) or lower(u.nickname) like lower(concat('%', :keyword, '%'))")
  Page<AppUser> search(@Param("keyword") String keyword, Pageable pageable);
}
interface NoticeRepository extends JpaRepository<Notice, Long> {
  @Query("select n from Notice n where (:admin = true or n.published = true) and (:keyword = '' or lower(n.title) like lower(concat('%', :keyword, '%')) or lower(n.content) like lower(concat('%', :keyword, '%')))")
  Page<Notice> search(@Param("admin") boolean admin, @Param("keyword") String keyword, Pageable pageable);
}
interface CommentRepository extends JpaRepository<Comment, Long> {
  Page<Comment> findByNoticeId(Long noticeId, Pageable pageable);
}
interface NotificationRepository extends JpaRepository<NotificationItem, Long> {
  Page<NotificationItem> findByUserId(Long userId, Pageable pageable);
  Page<NotificationItem> findByUserIdAndRead(Long userId, boolean read, Pageable pageable);
  long countByUserIdAndRead(Long userId, boolean read);
}
