package com.example.community.application;

import com.example.community.domain.CommunityCreationRequest;
import com.example.community.domain.CommunityRule;
import com.example.community.domain.CommunityTypes;
import com.example.community.domain.FieldValidationError;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class CommunityPolicyService {
    public static final UUID CATEGORY_ENTERTAINMENT = UUID.fromString("11111111-1111-1111-1111-111111111111");
    public static final UUID CATEGORY_FINANCE = UUID.fromString("22222222-2222-2222-2222-222222222222");
    public static final UUID CATEGORY_SOCIAL_ISSUES = UUID.fromString("33333333-3333-3333-3333-333333333333");

    private static final List<String> BLOCKED_TERMS = List.of("도박", "불법", "성인", "admin", "관리자");
    private static final List<String> IMPERSONATION_TERMS = List.of("공식", "official", "운영팀", "고객센터");

    private final CommunitySlugService slugService;

    public CommunityPolicyService(CommunitySlugService slugService) {
        this.slugService = slugService;
    }

    public List<CategoryOption> creatableCategories() {
        return List.of(
                new CategoryOption(CATEGORY_ENTERTAINMENT, "엔터테인먼트", true, true, false),
                new CategoryOption(CATEGORY_FINANCE, "금융/투자", true, true, true),
                new CategoryOption(CATEGORY_SOCIAL_ISSUES, "사회 이슈", true, true, true));
    }

    public Optional<CategoryOption> findCategory(UUID categoryId) {
        return creatableCategories().stream()
                .filter(category -> category.id().equals(categoryId))
                .findFirst();
    }

    public PolicyResult evaluate(CommunityCreationRequest request) {
        List<FieldValidationError> errors = new ArrayList<>();
        Set<RiskSignal> signals = new LinkedHashSet<>();

        validateIdentity(request, errors, signals);
        validateStructure(request, errors);

        CommunityTypes.RiskLevel riskLevel = riskLevel(signals);
        boolean requiresReview = signals.stream().anyMatch(RiskSignal::requiresReview);
        return new PolicyResult(errors, signals, riskLevel, requiresReview);
    }

    private void validateIdentity(
            CommunityCreationRequest request,
            List<FieldValidationError> errors,
            Set<RiskSignal> signals) {
        String displayName = request.getDisplayName();
        if (displayName == null || displayName.strip().length() < 2) {
            errors.add(new FieldValidationError("displayName", "REQUIRED", "커뮤니티 이름은 2자 이상 입력해야 합니다."));
        } else if (displayName.length() > 40) {
            errors.add(new FieldValidationError("displayName", "TOO_LONG", "커뮤니티 이름은 40자 이하로 입력해야 합니다."));
        }

        String normalizedText = ((displayName == null ? "" : displayName) + " " + (request.getDescription() == null ? "" : request.getDescription()))
                .toLowerCase(Locale.ROOT);
        for (String term : BLOCKED_TERMS) {
            if (normalizedText.contains(term)) {
                errors.add(new FieldValidationError("displayName", "RESTRICTED_WORD", "커뮤니티 이름 또는 소개에 사용할 수 없는 표현이 포함되어 있습니다."));
                break;
            }
        }
        for (String term : IMPERSONATION_TERMS) {
            if (normalizedText.contains(term)) {
                signals.add(new RiskSignal("IMPERSONATION_PATTERN", "사칭 또는 공식 채널 오인 가능성이 있어 운영자 검수가 필요합니다.", true, true));
                break;
            }
        }
        if (request.getDescription() == null || request.getDescription().isBlank()) {
            errors.add(new FieldValidationError("description", "REQUIRED", "커뮤니티 소개를 입력해 주세요."));
        } else if (request.getDescription().length() > 200) {
            errors.add(new FieldValidationError("description", "TOO_LONG", "커뮤니티 소개는 200자 이하로 입력해야 합니다."));
        }

        String slug = request.getSlug();
        if (!slugService.isSlugFormatValid(slug)) {
            errors.add(new FieldValidationError("slug", "INVALID_FORMAT", "주소는 영문 소문자, 숫자, 하이픈으로 3~40자 입력해야 합니다."));
        } else if (slugService.isReservedSlug(slug)) {
            errors.add(new FieldValidationError("slug", "RESERVED_SLUG", "운영 용도로 예약된 주소입니다."));
        }

        if (request.getCategoryId() == null) {
            errors.add(new FieldValidationError("categoryId", "REQUIRED", "카테고리를 선택해 주세요."));
        } else {
            Optional<CategoryOption> category = findCategory(request.getCategoryId());
            if (category.isEmpty() || !category.get().active() || !category.get().creatable()) {
                errors.add(new FieldValidationError("categoryId", "NOT_CREATABLE", "현재 신규 개설이 가능한 카테고리가 아닙니다."));
            } else if (category.get().requiresReview()) {
                signals.add(new RiskSignal("CATEGORY_REQUIRES_REVIEW", "선택한 카테고리는 공개 전 운영자 검수가 필요합니다.", false, true));
            }
        }
    }

    private void validateStructure(CommunityCreationRequest request, List<FieldValidationError> errors) {
        if (request.getBoards().isEmpty()) {
            errors.add(new FieldValidationError("boards", "REQUIRED", "공개 전 최소 1개의 게시판이 필요합니다."));
        }
        boolean hasRequiredRule = request.getRules().stream().anyMatch(CommunityRule::isRequiredRule);
        if (!hasRequiredRule) {
            errors.add(new FieldValidationError("rules", "REQUIRED", "공개 전 최소 1개의 필수 규칙이 필요합니다."));
        }
    }

    private CommunityTypes.RiskLevel riskLevel(Set<RiskSignal> signals) {
        if (signals.stream().anyMatch(RiskSignal::highSeverity)) {
            return CommunityTypes.RiskLevel.HIGH;
        }
        if (!signals.isEmpty()) {
            return CommunityTypes.RiskLevel.MEDIUM;
        }
        return CommunityTypes.RiskLevel.LOW;
    }

    public record CategoryOption(UUID id, String name, boolean active, boolean creatable, boolean requiresReview) {
    }

    public record RiskSignal(String code, String message, boolean highSeverity, boolean requiresReview) {
    }

    public record PolicyResult(
            List<FieldValidationError> errors,
            Set<RiskSignal> riskSignals,
            CommunityTypes.RiskLevel riskLevel,
            boolean requiresReview) {
        public Set<String> riskSignalCodes() {
            return riskSignals.stream().map(RiskSignal::code).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        }
    }
}
