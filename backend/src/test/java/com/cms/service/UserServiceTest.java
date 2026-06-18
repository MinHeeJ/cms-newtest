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
    void authenticateByEmailUsesStoredActiveUserAndUpdatesLastLogin() {
        CmsUser storedUser = CmsUser.builder()
            .id(UUID.fromString("11111111-1111-4111-8111-111111111111"))
            .email("admin@example.com")
            .displayName("관리자")
            .status("ACTIVE")
            .roles(Set.of("ADMIN"))
            .build();
        when(userRepo.findByEmail("admin@example.com")).thenReturn(Optional.of(storedUser));
        when(userRepo.save(storedUser)).thenReturn(storedUser);

        CmsUser authenticated = userService.authenticateByEmail("  ADMIN@example.com  ");

        assertThat(authenticated).isSameAs(storedUser);
        ArgumentCaptor<CmsUser> savedUser = ArgumentCaptor.forClass(CmsUser.class);
        verify(userRepo).save(savedUser.capture());
        assertThat(savedUser.getValue().getLastLoginAt()).isNotNull();
    }

    @Test
    void authenticateByEmailRejectsUnknownOrInactiveUsers() {
        when(userRepo.findByEmail("missing@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.authenticateByEmail("missing@example.com"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(error -> ((ResponseStatusException) error).getStatusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED);

        CmsUser suspendedUser = CmsUser.builder()
            .id(UUID.fromString("22222222-2222-4222-8222-222222222222"))
            .email("editor@example.com")
            .displayName("편집자")
            .status("SUSPENDED")
            .build();
        when(userRepo.findByEmail("editor@example.com")).thenReturn(Optional.of(suspendedUser));

        assertThatThrownBy(() -> userService.authenticateByEmail("editor@example.com"))
            .isInstanceOf(ResponseStatusException.class)
            .extracting(error -> ((ResponseStatusException) error).getStatusCode())
            .isEqualTo(HttpStatus.UNAUTHORIZED);
        verify(userRepo, never()).save(any(CmsUser.class));
    }
}
