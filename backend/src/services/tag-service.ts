import { conflict, notFound } from "../middleware/error-handler";
import type { Tag, TagCreateInput, TagUpdateInput } from "../models/tag";
import type { TagRepository } from "../repositories/tag-repository";

export const normalizeTagName = (name: string) => name.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export class TagService {
  constructor(private readonly tags: TagRepository) {}

  listTags(): Tag[] {
    return this.tags.list();
  }

  createTag(input: TagCreateInput): Tag {
    const name = input.name.trim().replace(/\s+/g, " ");
    const normalizedName = normalizeTagName(name);
    const existing = this.tags.findByNormalizedName(normalizedName);
    if (existing) {
      throw conflict("이미 존재하는 태그입니다.", { tagId: existing.tagId });
    }

    return this.tags.create({
      name,
      normalizedName,
      sortOrder: input.sortOrder
    });
  }

  updateTag(tagId: string, input: TagUpdateInput): Tag {
    const existing = this.tags.findById(tagId);
    if (!existing) {
      throw notFound("태그를 찾을 수 없습니다.");
    }

    let name: string | undefined;
    let normalizedName: string | undefined;
    if (input.name !== undefined) {
      name = input.name.trim().replace(/\s+/g, " ");
      normalizedName = normalizeTagName(name);
      const duplicate = this.tags.findByNormalizedName(normalizedName);
      if (duplicate && duplicate.tagId !== tagId) {
        throw conflict("이미 존재하는 태그 이름입니다.", { tagId: duplicate.tagId });
      }
    }

    const updated = this.tags.update(tagId, {
      name,
      normalizedName,
      sortOrder: input.sortOrder
    });

    if (!updated) {
      throw notFound("태그를 찾을 수 없습니다.");
    }

    return updated;
  }

  deleteTag(tagId: string): void {
    if (!this.tags.delete(tagId)) {
      throw notFound("태그를 찾을 수 없습니다.");
    }
  }
}
