import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IdeaEditor } from "../features/ideas/IdeaEditor";
import { draftToPayload, emptyIdeaDraft, useIdeaEditor } from "../features/ideas/useIdeaEditor";
import { apiClient, type Idea, type Tag } from "../services/api-client";

export function IdeaCapturePage() {
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .listTags()
      .then((response) => setTags(response.items))
      .catch((cause) => setLoadError(cause instanceof Error ? cause.message : "태그를 불러오지 못했습니다."));
  }, []);

  const saveDraft = useCallback(async (draft: ReturnType<typeof emptyIdeaDraft>): Promise<Idea> => {
    return apiClient.createIdea(draftToPayload(draft));
  }, []);

  const editor = useIdeaEditor({
    initialDraft: emptyIdeaDraft(),
    saveDraft
  });

  const createTag = async (name: string) => {
    const tag = await apiClient.createTag({ name });
    setTags((current) => [...current, tag].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)));
    return tag;
  };

  const handleSave = () => {
    void editor
      .save()
      .then((idea) => navigate(`/ideas/${idea.ideaId}`, { replace: true }))
      .catch(() => undefined);
  };

  return (
    <div className="editor-page">
      <div className="subnav">
        <Link className="btn btn-secondary" to="/ideas">
          <ArrowLeft size={16} />
          목록으로
        </Link>
      </div>
      {loadError ? <p className="inline-error">{loadError}</p> : null}
      <IdeaEditor
        draft={editor.draft}
        allTags={tags}
        saveStatus={editor.saveStatus}
        lastSavedAt={editor.lastSavedAt}
        error={editor.error}
        saveLabel="저장"
        onChange={editor.updateDraft}
        onSave={handleSave}
        onRetry={handleSave}
        onCreateTag={createTag}
      />
    </div>
  );
}
