package com.cms.security;

import com.cms.entity.CmsUser;
import com.cms.repository.UserRepository;
import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SessionFilterTest {
    private final UserRepository userRepository = mock(UserRepository.class);
    private final SessionFilter filter = new SessionFilter(userRepository);

    @Test
    void doesNotCreateImplicitSessionFromFirstStoredUser() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> { };

        filter.doFilter(request, response, chain);

        assertThat(request.getAttribute(SessionFilter.ATTR_USER)).isNull();
        verify(userRepository, never()).findAll();
    }

    @Test
    void resolvesActiveSessionUserFromCookie() throws Exception {
        UUID userId = UUID.fromString("11111111-1111-4111-8111-111111111111");
        CmsUser storedUser = CmsUser.builder()
            .id(userId)
            .email("admin@example.com")
            .displayName("관리자")
            .status("ACTIVE")
            .roles(Set.of("ADMIN"))
            .build();
        when(userRepository.findById(userId)).thenReturn(Optional.of(storedUser));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new jakarta.servlet.http.Cookie(SessionFilter.SESSION_COOKIE, userId.toString()));
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> { });

        assertThat(request.getAttribute(SessionFilter.ATTR_USER)).isSameAs(storedUser);
    }
}
