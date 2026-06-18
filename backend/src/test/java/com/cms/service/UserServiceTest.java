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
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
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
    void registerCreatesActiveAdminUser() {
        CmsUser saved = CmsUser.builder()
            .id(UUID.randomUUID())
            .email("new-admin@example.com")
            .displayName("신규 관리자")
            .status("ACTIVE")
            .roles(Set.of("ADMIN"))
            .build();
        Map<String, Object> mapped = Map.of(
            "id", saved.getId(),
            "email", saved.getEmail(),
            "displayName", saved.getDisplayName(),
            "status", saved.getStatus(),
            "roles", saved.getRoles()
        );

        when(userRepo.findByEmail("new-admin@example.com")).thenReturn(Optional.empty());
        when(userRepo.save(any(CmsUser.class))).thenReturn(saved);
        when(mapper.user(saved)).thenReturn(mapped);

        Map<String, Object> result = userService.register(Map.of(
            "email", "  New-Admin@Example.com  ",
            "displayName", " 신규 관리자 "
        ));

        ArgumentCaptor<CmsUser> userCaptor = ArgumentCaptor.forClass(CmsUser.class);
        verify(userRepo).save(userCaptor.capture());
        CmsUser userToSave = userCaptor.getValue();
        assertThat(userToSave.getEmail()).isEqualTo("new-admin@example.com");
        assertThat(userToSave.getDisplayName()).isEqualTo("신규 관리자");
        assertThat(userToSave.getStatus()).isEqualTo("ACTIVE");
        assertThat(userToSave.getRoles()).containsExactly("ADMIN");
        assertThat(result).isEqualTo(mapped);
    }

    @Test
    void registerRejectsDuplicateEmail() {
        when(userRepo.findByEmail("admin@example.com")).thenReturn(Optional.of(CmsUser.builder().email("admin@example.com").build()));

        assertThatThrownBy(() -> userService.register(Map.of("email", "admin@example.com", "displayName", "관리자")))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("이미 가입된 이메일입니다");

        verify(userRepo, never()).save(any(CmsUser.class));
    }
}
