import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ApiError,
  BoardInput,
  CategoryResponse,
  CommunityCreationRequest,
  JoinPolicy,
  ModeratorInvitationInput,
  RuleInput,
  SlugCheckResponse,
  SubmitCommunityCreationResponse,
  Visibility,
  attachMedia,
  checkSlug,
  createDraft,
  getCreationRequest,
  listCategories,
  newIdempotencyKey,
  replaceBoards,
  replaceModeratorInvitations,
  replaceRules,
  submitCreationRequest,
  updateCreationRequest
} from '../api/communityCreationClient';

export type WizardStep = 'identity' | 'access' | 'boards' | 'rules' | 'image' | 'moderators' | 'summary';

export const wizardSteps: Array<{ id: WizardStep; label: string }> = [
  { id: 'identity', label: '기본 정보' },
  { id: 'access', label: '공개 설정' },
  { id: 'boards', label: '게시판' },
  { id: 'rules', label: '규칙' },
  { id: 'image', label: '대표 이미지' },
  { id: 'moderators', label: '운영진' },
  { id: 'summary', label: '제출' }
];

const draftStorageKey = 'communityCreation.activeRequestId';

export interface IdentityValues {
  displayName: string;
  slug: string;
  categoryId: string;
  description: string;
}

export interface AccessValues {
  visibility: Visibility;
  joinPolicy: JoinPolicy;
}

export function useCommunityCreateWizard() {
  const [request, setRequest] = useState<CommunityCreationRequest | null>(null);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [activeStep, setActiveStep] = useState<WizardStep>('identity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [slugCheckResult, setSlugCheckResult] = useState<SlugCheckResponse | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitCommunityCreationResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      try {
        const savedDraftId = localStorage.getItem(draftStorageKey);
        const [draft, categoryList] = await Promise.all([loadOrCreateDraft(savedDraftId), listCategories()]);
        if (!cancelled) {
          setRequest(draft);
          localStorage.setItem(draftStorageKey, draft.id);
          setCategories(categoryList);
          setError(null);
        }
      } catch (caught) {
        if (!cancelled) {
          setError(caught as ApiError);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryMap = useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories]);

  const saveIdentity = useCallback(
    async (values: IdentityValues) => {
      if (!request) return;
      setSaving(true);
      try {
        const updated = await updateCreationRequest(request.id, values);
        setRequest(updated);
        setError(null);
      } catch (caught) {
        setError(caught as ApiError);
      } finally {
        setSaving(false);
      }
    },
    [request]
  );

  const saveAccess = useCallback(
    async (values: AccessValues) => {
      if (!request) return;
      setSaving(true);
      try {
        const updated = await updateCreationRequest(request.id, values);
        setRequest(updated);
        setError(null);
      } catch (caught) {
        setError(caught as ApiError);
      } finally {
        setSaving(false);
      }
    },
    [request]
  );

  const runSlugCheck = useCallback(async (slug: string) => {
    const result = await checkSlug(slug);
    setSlugCheckResult(result);
    return result;
  }, []);

  const saveBoards = useCallback(
    async (boards: BoardInput[]) => {
      if (!request) return;
      setSaving(true);
      try {
        const updated = await replaceBoards(request.id, boards);
        setRequest(updated);
        setError(null);
      } catch (caught) {
        setError(caught as ApiError);
      } finally {
        setSaving(false);
      }
    },
    [request]
  );

  const saveRules = useCallback(
    async (rules: RuleInput[]) => {
      if (!request) return;
      setSaving(true);
      try {
        const updated = await replaceRules(request.id, rules);
        setRequest(updated);
        setError(null);
      } catch (caught) {
        setError(caught as ApiError);
      } finally {
        setSaving(false);
      }
    },
    [request]
  );

  const saveInvitations = useCallback(
    async (invitations: ModeratorInvitationInput[]) => {
      if (!request) return;
      setSaving(true);
      try {
        const updated = await replaceModeratorInvitations(request.id, invitations);
        setRequest(updated);
        setError(null);
      } catch (caught) {
        setError(caught as ApiError);
      } finally {
        setSaving(false);
      }
    },
    [request]
  );

  const uploadImage = useCallback(
    async (file: File) => {
      if (!request) return;
      if (file.size > 5 * 1024 * 1024) {
        setError({ code: 'MEDIA_TOO_LARGE', message: '대표 이미지는 5MB 이하만 사용할 수 있습니다.' });
        return;
      }
      const dimensions = await readImageDimensions(file);
      setSaving(true);
      try {
        const asset = await attachMedia(request.id, {
          fileName: file.name,
          mimeType: file.type,
          byteSize: file.size,
          width: dimensions.width,
          height: dimensions.height
        });
        const updated = await updateCreationRequest(request.id, { representativeImageId: asset.id });
        setRequest(updated);
        setError(null);
      } catch (caught) {
        setError(caught as ApiError);
      } finally {
        setSaving(false);
      }
    },
    [request]
  );

  const submit = useCallback(async () => {
    if (!request) return;
    setSaving(true);
    try {
      const result = await submitCreationRequest(request.id, newIdempotencyKey());
      setRequest(result.request);
      setSubmitResult(result);
      if (result.result === 'LAUNCHED') {
        localStorage.removeItem(draftStorageKey);
      }
      setError(null);
    } catch (caught) {
      setError(caught as ApiError);
    } finally {
      setSaving(false);
    }
  }, [request]);

  return {
    request,
    categories,
    categoryMap,
    activeStep,
    setActiveStep,
    loading,
    saving,
    error,
    slugCheckResult,
    submitResult,
    saveIdentity,
    saveAccess,
    runSlugCheck,
    saveBoards,
    saveRules,
    saveInvitations,
    uploadImage,
    submit
  };
}

async function loadOrCreateDraft(savedDraftId: string | null) {
  if (savedDraftId) {
    try {
      const existing = await getCreationRequest(savedDraftId);
      if (existing.status !== 'LAUNCHED' && existing.status !== 'REJECTED') {
        return existing;
      }
      localStorage.removeItem(draftStorageKey);
    } catch {
      localStorage.removeItem(draftStorageKey);
    }
  }
  return createDraft();
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject({ code: 'IMAGE_READ_FAILED', message: '이미지 정보를 읽을 수 없습니다.' });
    };
    image.src = url;
  });
}
