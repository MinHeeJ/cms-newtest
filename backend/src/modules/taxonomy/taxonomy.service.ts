import { conflict, forbidden, notFound, validationError } from "../../api/middleware/error-handler.js";
import { getDataStore } from "../../persistence/database.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { hasPermission } from "../auth/permissions.js";
import type { TaxonomyInput, TaxonomyTerm, User } from "../content/content.types.js";
import { taxonomyRepository } from "./taxonomy.repository.js";

export class TaxonomyService {
  list(type?: TaxonomyTerm["type"]) {
    return taxonomyRepository.list(type);
  }

  save(input: TaxonomyInput, user: User, termId?: string): TaxonomyTerm {
    if (!hasPermission(user, "taxonomy:manage")) {
      throw forbidden();
    }
    if (input.type === "TAG" && input.parentId) {
      throw validationError("태그는 상위 분류를 가질 수 없습니다.");
    }
    if (input.parentId === termId) {
      throw validationError("자기 자신을 상위 분류로 지정할 수 없습니다.");
    }

    const existing = taxonomyRepository.findBySlug(input.type, input.slug);
    if (existing && existing.id !== termId) {
      throw conflict("같은 유형의 분류 slug가 이미 존재합니다.");
    }

    if (input.parentId && !taxonomyRepository.find(input.parentId)) {
      throw validationError("상위 분류를 찾을 수 없습니다.");
    }

    const existingTerm = termId ? taxonomyRepository.find(termId) : undefined;
    if (termId && !existingTerm) {
      throw notFound("분류를 찾을 수 없습니다.");
    }
    const beforeState = existingTerm ? { name: existingTerm.name, slug: existingTerm.slug, type: existingTerm.type } : null;
    const term = existingTerm ? taxonomyRepository.update(existingTerm, input) : taxonomyRepository.create(input);
    workflowEventService.write({
      eventType: existingTerm ? "UPDATE" : "CREATE",
      actor: user,
      targetType: "TaxonomyTerm",
      targetId: term.id,
      beforeState,
      afterState: { name: term.name, slug: term.slug, type: term.type }
    });
    return term;
  }

  delete(termId: string, confirm: boolean, user: User): void {
    if (!hasPermission(user, "taxonomy:manage")) {
      throw forbidden();
    }
    const term = taxonomyRepository.find(termId);
    if (!term) {
      throw notFound("분류를 찾을 수 없습니다.");
    }
    const usageCount = getDataStore().contentItems.filter(
      (content) => content.categories.some((category) => category.id === term.id) || content.tags.some((tag) => tag.id === term.id)
    ).length;
    if (usageCount > 0 && !confirm) {
      throw validationError(`이 분류를 사용하는 콘텐츠 ${usageCount}건이 있습니다.`);
    }
    taxonomyRepository.delete(term);
    workflowEventService.write({
      eventType: "DELETE",
      actor: user,
      targetType: "TaxonomyTerm",
      targetId: term.id,
      beforeState: { name: term.name, slug: term.slug, usageCount }
    });
  }
}

export const taxonomyService = new TaxonomyService();
