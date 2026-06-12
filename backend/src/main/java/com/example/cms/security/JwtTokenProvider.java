package com.example.cms.security;

import com.example.cms.config.CmsProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import org.springframework.stereotype.Component;

@Component
public class JwtTokenProvider {
    private final CmsProperties properties;
    private final Key key;

    public JwtTokenProvider(CmsProperties properties) {
        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(properties.getJwt().getSecret().getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(String username, String role) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.getJwt().getExpirationMinutes() * 60);
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expiresAt))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public JwtPrincipal parse(String token) {
        Jws<Claims> claims = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
        return new JwtPrincipal(claims.getBody().getSubject(), String.valueOf(claims.getBody().get("role")));
    }

    public boolean isValid(String token) {
        try {
            parse(token);
            return true;
        } catch (RuntimeException exception) {
            return false;
        }
    }

    public record JwtPrincipal(String username, String role) {
    }
}
