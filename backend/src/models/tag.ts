export interface Tag {
  tagId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface TagRecord extends Tag {
  normalizedName: string;
}

export interface IdeaTag {
  ideaId: string;
  tagId: string;
  createdAt: string;
}

export interface TagCreateInput {
  name: string;
  sortOrder?: number;
}

export interface TagUpdateInput {
  name?: string;
  sortOrder?: number;
}
