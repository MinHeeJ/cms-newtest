export type IdeaStatus = "captured" | "developing" | "archived";
export type SaveStatus = "saving" | "saved" | "failed";

export interface Tag {
  tagId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Idea {
  ideaId: string;
  title: string;
  body: string;
  status: IdeaStatus;
  accentColor: string;
  isPinned: boolean;
  tags: Tag[];
  actionItemSummary: {
    total: number;
    completed: number;
  };
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  lastSavedAt: string | null;
}

export interface IdeaActionItem {
  actionItemId: string;
  ideaId: string;
  text: string;
  isCompleted: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface IdeaListResponse {
  items: Idea[];
  page: number;
  pageSize: number;
  total: number;
}

export interface IdeaListParams {
  [key: string]: string | number | boolean | undefined;
  q?: string;
  status?: IdeaStatus;
  tag?: string;
  pinned?: boolean;
  sort?: "updated_desc" | "created_desc" | "title_asc";
  page?: number;
  pageSize?: number;
}

export interface IdeaDraftPayload {
  title?: string;
  body?: string;
  tagIds?: string[];
  status?: IdeaStatus;
  accentColor?: string;
  isPinned?: boolean;
}

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, status: number, code: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    }
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiClientError(
      data?.message ?? "요청 처리에 실패했습니다.",
      response.status,
      data?.code ?? "REQUEST_FAILED",
      data?.details
    );
  }

  return data as T;
};

const withQuery = (path: string, params: Record<string, string | number | boolean | undefined>) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      search.set(key, String(value));
    }
  });
  const query = search.toString();
  return query ? `${path}?${query}` : path;
};

export const apiClient = {
  listIdeas(params: IdeaListParams = {}) {
    return request<IdeaListResponse>(withQuery("/api/ideas", params));
  },
  getIdea(ideaId: string) {
    return request<Idea>(`/api/ideas/${ideaId}`);
  },
  createIdea(payload: IdeaDraftPayload) {
    return request<Idea>("/api/ideas", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateIdea(ideaId: string, payload: IdeaDraftPayload) {
    return request<Idea>(`/api/ideas/${ideaId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  deleteIdea(ideaId: string) {
    return request<void>(`/api/ideas/${ideaId}`, {
      method: "DELETE"
    });
  },
  listTags() {
    return request<{ items: Tag[] }>("/api/tags");
  },
  createTag(payload: { name: string; sortOrder?: number }) {
    return request<Tag>("/api/tags", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateTag(tagId: string, payload: { name?: string; sortOrder?: number }) {
    return request<Tag>(`/api/tags/${tagId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  deleteTag(tagId: string) {
    return request<void>(`/api/tags/${tagId}`, {
      method: "DELETE"
    });
  },
  listActionItems(ideaId: string) {
    return request<{ items: IdeaActionItem[] }>(`/api/ideas/${ideaId}/action-items`);
  },
  createActionItem(ideaId: string, payload: { text: string; sortOrder?: number }) {
    return request<IdeaActionItem>(`/api/ideas/${ideaId}/action-items`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },
  updateActionItem(ideaId: string, actionItemId: string, payload: { text?: string; isCompleted?: boolean; sortOrder?: number }) {
    return request<IdeaActionItem>(`/api/ideas/${ideaId}/action-items/${actionItemId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },
  deleteActionItem(ideaId: string, actionItemId: string) {
    return request<void>(`/api/ideas/${ideaId}/action-items/${actionItemId}`, {
      method: "DELETE"
    });
  }
};
