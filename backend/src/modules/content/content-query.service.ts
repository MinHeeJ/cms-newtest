import { contentRepository, type ContentQuery } from "./content.repository.js";

export class ContentQueryService {
  list(query: ContentQuery) {
    return contentRepository.list(query);
  }
}

export const contentQueryService = new ContentQueryService();
