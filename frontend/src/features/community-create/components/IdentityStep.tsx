import { CheckCircle2, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { CategoryResponse, CommunityCreationRequest, SlugCheckResponse } from '../api/communityCreationClient';
import { IdentityValues } from '../state/useCommunityCreateWizard';

interface IdentityStepProps {
  request: CommunityCreationRequest;
  categories: CategoryResponse[];
  slugCheckResult: SlugCheckResponse | null;
  saving: boolean;
  onCheckSlug: (slug: string) => Promise<SlugCheckResponse>;
  onSave: (values: IdentityValues) => Promise<void>;
  onNext: () => void;
}

export function IdentityStep({
  request,
  categories,
  slugCheckResult,
  saving,
  onCheckSlug,
  onSave,
  onNext
}: IdentityStepProps) {
  const [values, setValues] = useState<IdentityValues>({
    displayName: request.displayName ?? '',
    slug: request.slug ?? '',
    categoryId: request.categoryId ?? categories[0]?.id ?? '',
    description: request.description ?? ''
  });

  useEffect(() => {
    setValues({
      displayName: request.displayName ?? '',
      slug: request.slug ?? '',
      categoryId: request.categoryId ?? categories[0]?.id ?? '',
      description: request.description ?? ''
    });
  }, [categories, request]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSave(values);
    onNext();
  }

  return (
    <form className="wizard-form" onSubmit={handleSubmit}>
      <div>
        <span className="section-kicker">Identity</span>
        <h2>이름과 주소를 먼저 고정하세요</h2>
        <p className="text-sm leading-6 text-muted-foreground">주소는 공개 링크가 되므로 사용 가능 여부를 바로 확인할 수 있습니다.</p>
      </div>

      <label>
        <span>커뮤니티 이름</span>
        <input
          value={values.displayName}
          maxLength={40}
          onChange={(event) => setValues({ ...values, displayName: event.target.value })}
          placeholder="예: 영화 수다방"
          required
        />
      </label>

      <SlugInputWithAvailability
        slug={values.slug}
        result={slugCheckResult}
        onSlugChange={(slug) => setValues({ ...values, slug })}
        onCheckSlug={onCheckSlug}
      />

      <CategorySelector
        categories={categories}
        value={values.categoryId}
        onChange={(categoryId) => setValues({ ...values, categoryId })}
      />

      <label>
        <span>소개</span>
        <textarea
          value={values.description}
          maxLength={200}
          onChange={(event) => setValues({ ...values, description: event.target.value })}
          placeholder="새 커뮤니티의 주제와 이용 분위기를 짧게 설명해 주세요."
          required
        />
      </label>

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={saving}>
          저장 후 다음
        </button>
      </div>
    </form>
  );
}

function SlugInputWithAvailability({
  slug,
  result,
  onSlugChange,
  onCheckSlug
}: {
  slug: string;
  result: SlugCheckResponse | null;
  onSlugChange: (slug: string) => void;
  onCheckSlug: (slug: string) => Promise<SlugCheckResponse>;
}) {
  return (
    <label>
      <span>커뮤니티 주소</span>
      <div className="slug-row">
        <span className="slug-prefix">/c/</span>
        <input value={slug} maxLength={40} onChange={(event) => onSlugChange(event.target.value)} placeholder="movie-talk" required />
        <button className="icon-text-button max-sm:col-span-2" type="button" onClick={() => void onCheckSlug(slug)} disabled={!slug}>
          <Search size={16} aria-hidden="true" />
          중복 확인
        </button>
      </div>
      {result ? (
        <span className={result.available ? 'field-hint success' : 'field-hint danger'}>
          {result.available ? (
            <>
              <CheckCircle2 size={15} aria-hidden="true" /> 사용 가능한 주소입니다.
            </>
          ) : (
            result.message
          )}
        </span>
      ) : (
        <span className="field-hint">영문 소문자, 숫자, 하이픈만 사용할 수 있습니다.</span>
      )}
    </label>
  );
}

function CategorySelector({
  categories,
  value,
  onChange
}: {
  categories: CategoryResponse[];
  value: string;
  onChange: (categoryId: string) => void;
}) {
  return (
    <label>
      <span>카테고리</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} required>
        {categories.map((category) => (
          <option key={category.id} value={category.id} disabled={!category.creatable}>
            {category.name}
            {category.requiresReview ? ' · 검수 필요' : ''}
            {!category.creatable ? ' · 생성 제한' : ''}
          </option>
        ))}
      </select>
      <span className="field-hint">검수가 필요한 카테고리는 제출 후 운영자 승인 전까지 공개되지 않습니다.</span>
    </label>
  );
}
