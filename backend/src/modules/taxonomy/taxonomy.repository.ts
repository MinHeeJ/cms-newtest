import { createId, getDataStore, timestamp } from "../../persistence/database.js";
import type { TaxonomyInput, TaxonomyTerm } from "../content/content.types.js";

export class TaxonomyRepository {
  list(type?: TaxonomyTerm["type"]): TaxonomyTerm[] {
    return getDataStore().taxonomyTerms
      .filter((term) => !type || term.type === type)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
  }

  find(termId: string): TaxonomyTerm | undefined {
    return getDataStore().taxonomyTerms.find((term) => term.id === termId);
  }

  findBySlug(type: TaxonomyTerm["type"], slug: string): TaxonomyTerm | undefined {
    return getDataStore().taxonomyTerms.find((term) => term.type === type && term.slug === slug);
  }

  create(input: TaxonomyInput): TaxonomyTerm {
    const createdAt = timestamp();
    const term: TaxonomyTerm = {
      id: createId(),
      type: input.type,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      parentId: input.parentId ?? null,
      sortOrder: input.sortOrder ?? null,
      createdAt,
      updatedAt: createdAt
    };
    getDataStore().taxonomyTerms.push(term);
    return term;
  }

  update(term: TaxonomyTerm, input: TaxonomyInput): TaxonomyTerm {
    term.type = input.type;
    term.name = input.name;
    term.slug = input.slug;
    term.description = input.description ?? null;
    term.parentId = input.parentId ?? null;
    term.sortOrder = input.sortOrder ?? null;
    term.updatedAt = timestamp();
    return term;
  }

  delete(term: TaxonomyTerm): void {
    const store = getDataStore();
    store.taxonomyTerms = store.taxonomyTerms.filter((candidate) => candidate.id !== term.id);
  }
}

export const taxonomyRepository = new TaxonomyRepository();
