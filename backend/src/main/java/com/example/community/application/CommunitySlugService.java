package com.example.community.application;

import com.example.community.repository.CommunityCreationRepositories;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CommunitySlugService {
    private static final Set<String> RESERVED_SLUGS = Set.of("admin", "admins", "operator", "official", "notice", "support");
    private final CommunityCreationRepositories repositories;

    public CommunitySlugService(CommunityCreationRepositories repositories) {
        this.repositories = repositories;
    }

    public String normalizeSlug(String rawSlug) {
        if (rawSlug == null) {
            return "";
        }
        String normalized = Normalizer.normalize(rawSlug, Normalizer.Form.NFKC)
                .toLowerCase(Locale.ROOT)
                .trim()
                .replaceAll("[_\\s]+", "-")
                .replaceAll("[^a-z0-9-]", "")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
        return normalized;
    }

    public String normalizeName(String rawName) {
        if (rawName == null) {
            return "";
        }
        return Normalizer.normalize(rawName, Normalizer.Form.NFKC)
                .toLowerCase(Locale.ROOT)
                .replaceAll("\\s+", " ")
                .trim();
    }

    public boolean isSlugFormatValid(String normalizedSlug) {
        return normalizedSlug != null
                && normalizedSlug.length() >= 3
                && normalizedSlug.length() <= 40
                && normalizedSlug.matches("^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$");
    }

    public boolean isReservedSlug(String normalizedSlug) {
        return RESERVED_SLUGS.contains(normalizedSlug);
    }

    public boolean isAvailable(String normalizedSlug) {
        return isAvailable(normalizedSlug, new UUID(0L, 0L));
    }

    public boolean isAvailable(String normalizedSlug, UUID excludingRequestId) {
        return !repositories.existsCommunitySlug(normalizedSlug)
                && !repositories.existsSubmittedRequestSlug(normalizedSlug, excludingRequestId);
    }
}
