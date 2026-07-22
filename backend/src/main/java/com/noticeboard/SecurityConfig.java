package com.noticeboard;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.OncePerRequestFilter;

@Configuration
class SecurityConfig {
  @Bean PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }
  @Bean SecurityFilterChain security(HttpSecurity http, JwtAuthFilter jwt, AuthenticationEntryPoint entry, AccessDeniedHandler denied) throws Exception {
    return http.csrf(c -> c.disable()).cors(c -> {}).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .exceptionHandling(e -> e.authenticationEntryPoint(entry).accessDeniedHandler(denied))
      .authorizeHttpRequests(a -> a
        .requestMatchers(HttpMethod.GET, "/api/health", "/api/notices", "/api/notices/*", "/api/notices/*/comments").permitAll()
        .requestMatchers(HttpMethod.POST, "/api/auth/signup", "/api/auth/login").permitAll()
        .requestMatchers("/api/admin/**").hasRole("ADMIN")
        .requestMatchers(HttpMethod.POST, "/api/notices").hasRole("ADMIN")
        .requestMatchers(HttpMethod.PUT, "/api/notices/*").hasRole("ADMIN")
        .requestMatchers(HttpMethod.DELETE, "/api/notices/*").hasRole("ADMIN")
        .anyRequest().authenticated())
      .addFilterBefore(jwt, UsernamePasswordAuthenticationFilter.class).build();
  }
  @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.cors-origins}") String origins) {
    CorsConfiguration cfg = new CorsConfiguration();
    for (String origin : origins.split(",")) cfg.addAllowedOrigin(origin.trim());
    cfg.addAllowedMethod("*"); cfg.addAllowedHeader("*"); cfg.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/api/**", cfg); return source;
  }
  @Bean AuthenticationEntryPoint entry(ObjectMapper mapper) { return (req, res, ex) -> write(res, 401, ApiResponse.fail("UNAUTHORIZED", "인증이 필요합니다."), mapper); }
  @Bean AccessDeniedHandler denied(ObjectMapper mapper) { return (req, res, ex) -> write(res, 403, ApiResponse.fail("FORBIDDEN", "권한이 없습니다."), mapper); }
  static void write(HttpServletResponse res, int status, Object body, ObjectMapper mapper) throws IOException { res.setStatus(status); res.setContentType(MediaType.APPLICATION_JSON_VALUE); mapper.writeValue(res.getWriter(), body); }
}

@Component
class JwtService {
  private final String secret;
  JwtService(@Value("${app.jwt-secret}") String secret) { this.secret = secret; }
  String issue(AppUser user) {
    String header = b64("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
    long exp = Instant.now().plusSeconds(86400).getEpochSecond();
    String payload = b64("{\"sub\":\"" + user.email + "\",\"role\":\"" + user.role + "\",\"exp\":" + exp + "}");
    return header + "." + payload + "." + sign(header + "." + payload);
  }
  String subject(String token) {
    try {
      String[] p = token.split("\\.");
      if (p.length != 3 || !sign(p[0] + "." + p[1]).equals(p[2])) return null;
      String json = new String(Base64.getUrlDecoder().decode(p[1]), StandardCharsets.UTF_8);
      long exp = Long.parseLong(json.replaceAll(".*\\\"exp\\\":([0-9]+).*", "$1"));
      if (Instant.now().getEpochSecond() > exp) return null;
      return json.replaceAll(".*\\\"sub\\\":\\\"([^\\\"]+)\\\".*", "$1");
    } catch (Exception e) { return null; }
  }
  private String b64(String raw) { return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8)); }
  private String sign(String data) {
    try {
      Mac mac = Mac.getInstance("HmacSHA256"); mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception e) { throw new IllegalStateException(e); }
  }
}

@Component
class JwtAuthFilter extends OncePerRequestFilter {
  private final JwtService jwt; private final UserRepository users;
  JwtAuthFilter(JwtService jwt, UserRepository users) { this.jwt = jwt; this.users = users; }
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {
    String header = req.getHeader("Authorization");
    if (header != null && header.startsWith("Bearer ")) {
      String email = jwt.subject(header.substring(7));
      if (email != null) users.findByEmail(email).ifPresent(u -> SecurityContextHolder.getContext().setAuthentication(
        new UsernamePasswordAuthenticationToken(u.email, null, java.util.List.of(new SimpleGrantedAuthority("ROLE_" + u.role.name())))));
    }
    chain.doFilter(req, res);
  }
}
