package com.cms.service;

import com.cms.entity.CmsUser;
import com.cms.repository.UserRepository;
import com.cms.repository.WorkflowEventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock private UserRepository userRepo;
    @Mock private WorkflowEventRepository eventRepo;
    @Mock private DtoMapper mapper;
    @InjectMocks private UserService userService;

    @Test
    void authenticateUsesStoredActiveUserCredentialsAndUpdatesLastLogin() {
        CmsUser storedUser = CmsUser.builder()
            .id(UUID.fromString("11111111-1111-4111-8111-111111111111"))
            .username("basic")
            .email("admin@example.com")
            .passwordHash("{noop}basic")
            .displayName("관리자")
            .status("ACTIVE")
            .roles(Set.of("ADMIN"))
            .build();
        when(userRepo.findByUsername("basic")).thenReturn(Optional.of(storedUser));
        when(userRepo.save(storedUser)).thenReturn(storedUser);

        CmsUser authenticated = userService.authenticate("  BASIC  ", "basic");

        assertThat(authenticated).isSameAs(storedUser);
        ArgumentCaptor<CmsUser> savedUser = ArgumentCaptor.forClass(CmsUser.class);
        verify(userRepo).save(savedUser.capture());
        assertThat(savedUser.getValue().getLastLoginAt()).isNotNull();
    }

    @Test
    void authenticateRejectsUnknownInactiveOrInvalidPasswordUsers() {
        when(userRepo.findByUsername("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.authenticate("missing", "basic"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(error -> ((ResponseStatusException) error).getStatusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED);

        CmsUser suspendedUser = CmsUser.builder()
            .id(UUID.fromString("22222222-2222-4222-8222-222222222222"))
            .username("editor")
            .email("editor@example.com")
            .passwordHash("{noop}basic")
            .displayName("편집자")
            .status("SUSPENDED")
            .build();
        when(userRepo.findByUsername("editor")).thenReturn(Optional.of(suspendedUser));

        assertThatThrownBy(() -> userService.authenticate("editor", "basic"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(error -> ((ResponseStatusException) error).getStatusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED);

        CmsUser storedUser = CmsUser.builder()
            .id(UUID.fromString("33333333-3333-4333-8333-333333333333"))
            .username("author")
            .email("author@example.com")
            .passwordHash("{noop}basic")
            .displayName("작성자")
            .status("ACTIVE")
            .build();
        when(userRepo.findByUsername("author")).thenReturn(Optional.of(storedUser));

        assertThatThrownBy(() -> userService.authenticate("author", "wrong"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(error -> ((ResponseStatusException) error).getStatusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(userRepo, never()).save(any(CmsUser.class));
    }

    @Test
    void registerCreatesActiveViewerWhenPasswordConfirmationMatches() {
        when(userRepo.existsByUsername("newuser")).thenReturn(false);
        when(userRepo.existsByEmail("newuser@local.cms")).thenReturn(false);
        when(userRepo.save(any(CmsUser.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CmsUser registered = userService.register(" NewUser ", "new-password", "new-password");

        assertThat(registered.getUsername()).isEqualTo("newuser");
        assertThat(registered.getEmail()).isEqualTo("newuser@local.cms");
        assertThat(registered.getDisplayName()).isEqualTo("newuser");
        assertThat(registered.getStatus()).isEqualTo("ACTIVE");
        assertThat(registered.getRoles()).containsExactly("VIEWER");
        assertThat(registered.getPasswordHash()).isNotBlank();
        assertThat(registered.getPasswordHash()).isNotEqualTo("new-password");
    }

    @Test
    void registerRejectsDuplicateUsernamesAndMismatchedPasswords() {
        when(userRepo.existsByUsername("basic")).thenReturn(true);

        assertThatThrownBy(() -> userService.register("basic", "password", "password"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(error -> ((ResponseStatusException) error).getStatusCode())
            .isEqualTo(HttpStatus.CONFLICT);

        assertThatThrownBy(() -> userService.register("newuser", "password", "different"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(error -> ((ResponseStatusException) error).getStatusCode())
            .isEqualTo(HttpStatus.BAD_REQUEST);
    }
}
