import type { Tag } from "./tag";

export type IdeaStatus = "captured" | "developing" | "archived";

export type AccentColor = "yellow" | "mint" | "coral" | "sky" | "violet";

export interface ActionItemSummary {
  total: number;
  completed: number;
}

export interface Idea {
  ideaId: string;
  title: string;
  body: string;
  status: IdeaStatus;
  accentColor: string;
  isPinned: boolean;
  tags: Tag[];
  actionItemSummary: ActionItemSummary;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  lastSavedAt: string | null;
}

export interface IdeaRecord {
  ideaId: string;
  title: string;
  body: string;
  status: IdeaStatus;
  accentColor: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  lastSavedAt: string | null;
}

export interface IdeaCreateInput {
  title?: string;
  body?: string;
  tagIds?: string[];
  accentColor?: string;
  isPinned?: boolean;
}

export interface IdeaUpdateInput {
  title?: string;
  body?: string;
  status?: IdeaStatus;
  tagIds?: string[];
  accentColor?: string;
  isPinned?: boolean;
}

export interface IdeaListQuery {
  q?: string;
  status?: IdeaStatus;
  tag?: string;
  pinned?: boolean;
  sort?: "updated_desc" | "created_desc" | "title_asc";
  page: number;
  pageSize: number;
}

export interface IdeaListResponse {
  items: Idea[];
  page: number;
  pageSize: number;
  total: number;
}
