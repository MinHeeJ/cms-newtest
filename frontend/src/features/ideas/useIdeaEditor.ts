import { useCallback, useState } from "react";
import type { Idea, IdeaDraftPayload, IdeaStatus, SaveStatus } from "../../services/api-client";

export interface IdeaDraft {
  title: string;
  body: string;
  tagIds: string[];
  status: IdeaStatus;
  accentColor: string;
  isPinned: boolean;
}

export const emptyIdeaDraft = (): IdeaDraft => ({
  title: "",
  body: "",
  tagIds: [],
  status: "captured",
  accentColor: "yellow",
  isPinned: false
});

export const ideaToDraft = (idea: Idea): IdeaDraft => ({
  title: idea.title,
  body: idea.body,
  tagIds: idea.tags.map((tag) => tag.tagId),
  status: idea.status,
  accentColor: idea.accentColor,
  isPinned: idea.isPinned
});

export const draftToPayload = (draft: IdeaDraft): IdeaDraftPayload => ({
  title: draft.title,
  body: draft.body,
  tagIds: draft.tagIds,
  status: draft.status,
  accentColor: draft.accentColor,
  isPinned: draft.isPinned
});

interface UseIdeaEditorOptions {
  initialDraft: IdeaDraft;
  initialLastSavedAt?: string | null;
  saveDraft: (draft: IdeaDraft) => Promise<Idea>;
}

export function useIdeaEditor({ initialDraft, initialLastSavedAt, saveDraft }: UseIdeaEditorOptions) {
  const [draft, setDraft] = useState<IdeaDraft>(initialDraft);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialLastSavedAt ?? null);
  const [error, setError] = useState<string | null>(null);

  const updateDraft = useCallback(<K extends keyof IdeaDraft>(key: K, value: IdeaDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  }, []);

  const save = useCallback(async () => {
    setSaveStatus("saving");
    setError(null);
    try {
      const idea = await saveDraft(draft);
      setDraft(ideaToDraft(idea));
      setLastSavedAt(idea.lastSavedAt ?? idea.updatedAt);
      setSaveStatus("saved");
      return idea;
    } catch (cause) {
      setSaveStatus("failed");
      setError(cause instanceof Error ? cause.message : "저장하지 못했습니다.");
      throw cause;
    }
  }, [draft, saveDraft]);

  return {
    draft,
    setDraft,
    updateDraft,
    save,
    retry: save,
    saveStatus,
    lastSavedAt,
    error
  };
}
