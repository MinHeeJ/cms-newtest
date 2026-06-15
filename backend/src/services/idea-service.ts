import { badRequest, notFound } from "../middleware/error-handler";
import type { Idea, IdeaCreateInput, IdeaListQuery, IdeaListResponse, IdeaUpdateInput } from "../models/idea";
import type { IdeaRepository } from "../repositories/idea-repository";
import type { TagRepository } from "../repositories/tag-repository";

export class IdeaService {
  constructor(
    private readonly ideas: IdeaRepository,
    private readonly tags: TagRepository
  ) {}

  listIdeas(query: IdeaListQuery): IdeaListResponse {
    return this.ideas.list(query);
  }

  getIdea(ideaId: string): Idea {
    const idea = this.ideas.getIdea(ideaId);
    if (!idea) {
      throw notFound("아이디어를 찾을 수 없습니다.");
    }
    return idea;
  }

  createIdea(input: IdeaCreateInput): Idea {
    this.assertTagsExist(input.tagIds ?? []);
    const record = this.ideas.create(input);
    if (input.tagIds) {
      this.ideas.replaceTags(record.ideaId, input.tagIds);
    }
    return this.getIdea(record.ideaId);
  }

  updateIdea(ideaId: string, input: IdeaUpdateInput): Idea {
    const current = this.ideas.findRecordById(ideaId);
    if (!current) {
      throw notFound("아이디어를 찾을 수 없습니다.");
    }

    const nextTitle = input.title !== undefined ? input.title.trim() : current.title;
    const nextBody = input.body !== undefined ? input.body.trim() : current.body;
    if (!nextTitle && !nextBody) {
      throw badRequest("제목 또는 본문 중 하나는 입력해야 합니다.");
    }

    if (input.tagIds) {
      this.assertTagsExist(input.tagIds);
    }

    const updated = this.ideas.update(ideaId, input);
    if (!updated) {
      throw notFound("아이디어를 찾을 수 없습니다.");
    }

    if (input.tagIds) {
      this.ideas.replaceTags(ideaId, input.tagIds);
    }

    return this.getIdea(ideaId);
  }

  deleteIdea(ideaId: string): void {
    if (!this.ideas.delete(ideaId)) {
      throw notFound("아이디어를 찾을 수 없습니다.");
    }
  }

  private assertTagsExist(tagIds: string[]): void {
    const uniqueTagIds = [...new Set(tagIds)];
    const found = this.tags.findManyByIds(uniqueTagIds);
    if (found.length !== uniqueTagIds.length) {
      throw badRequest("존재하지 않는 태그가 포함되어 있습니다.");
    }
  }
}
