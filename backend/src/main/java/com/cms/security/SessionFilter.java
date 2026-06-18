package com.cms.security;
import com.cms.entity.CmsUser;
import com.cms.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.*;
@Component
@RequiredArgsConstructor
public class SessionFilter extends OncePerRequestFilter {
    private final UserRepository userRepo;
    public static final String ATTR_USER = "currentUser";
    public static final String SESSION_COOKIE = "CMS_SESSION_USER_ID";
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        CmsUser user = userFromCookie(req).orElse(null);
        req.setAttribute(ATTR_USER, user);
        chain.doFilter(req, res);
    }

    private Optional<CmsUser> userFromCookie(HttpServletRequest req) {
        Cookie[] cookies = req.getCookies();
        if (cookies == null) return Optional.empty();
        return Arrays.stream(cookies)
            .filter(cookie -> SESSION_COOKIE.equals(cookie.getName()))
            .findFirst()
            .flatMap(cookie -> {
                try {
                    return userRepo.findById(UUID.fromString(cookie.getValue()));
                } catch (IllegalArgumentException ignored) {
                    return Optional.empty();
                }
            });
    }
}
