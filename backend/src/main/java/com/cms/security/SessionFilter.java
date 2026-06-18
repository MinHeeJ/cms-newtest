package com.cms.security;
import com.cms.entity.CmsUser;
import com.cms.repository.UserRepository;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
@Component
@RequiredArgsConstructor
public class SessionFilter extends OncePerRequestFilter {
    private final UserRepository userRepo;
    public static final String ATTR_USER = "currentUser";
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String email = req.getHeader("X-CMS-User");
        String role  = req.getHeader("X-CMS-Role");
        CmsUser user = null;
        if (email != null && !email.isBlank())
            user = userRepo.findByEmail(email).orElse(null);
        if (user == null && role != null && !role.isBlank()) {
            List<CmsUser> byRole = userRepo.findByRolesContaining(role.toUpperCase());
            if (!byRole.isEmpty()) user = byRole.get(0);
        }
        if (user == null) {
            List<CmsUser> all = userRepo.findAll();
            if (!all.isEmpty()) user = all.get(0);
        }
        req.setAttribute(ATTR_USER, user);
        chain.doFilter(req, res);
    }
}
