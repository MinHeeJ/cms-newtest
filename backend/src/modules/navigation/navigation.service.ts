import { conflict, forbidden, notFound, validationError } from "../../api/middleware/error-handler.js";
import { getDataStore } from "../../persistence/database.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { hasPermission } from "../auth/permissions.js";
import type { NavigationMenu, NavigationMenuInput, User } from "../content/content.types.js";
import { navigationRepository } from "./navigation.repository.js";

export class NavigationService {
  list(): NavigationMenu[] {
    return navigationRepository.list();
  }

  save(input: NavigationMenuInput, user: User, menuId?: string): NavigationMenu {
    if (!hasPermission(user, "navigation:manage")) {
      throw forbidden();
    }
    const duplicateKey = getDataStore().navigationMenus.find((menu) => menu.key === input.key && menu.id !== menuId);
    if (duplicateKey) {
      throw conflict("이미 사용 중인 메뉴 key입니다.");
    }

    for (const item of input.items) {
      if (item.targetType === "URL" && !item.url) {
        throw validationError("URL 메뉴 항목에는 URL이 필요합니다.");
      }
      if (item.targetType !== "URL" && !item.targetId) {
        throw validationError("콘텐츠 또는 카테고리 메뉴 항목에는 targetId가 필요합니다.");
      }
      if (item.targetType === "CONTENT") {
        const target = getDataStore().contentItems.find((content) => content.id === item.targetId);
        if (!target || target.status !== "PUBLISHED") {
          throw validationError("공개된 콘텐츠만 메뉴 대상으로 지정할 수 있습니다.");
        }
      }
    }

    const existingMenu = menuId ? navigationRepository.find(menuId) : undefined;
    if (menuId && !existingMenu) {
      throw notFound("메뉴를 찾을 수 없습니다.");
    }
    const beforeState = existingMenu ? { key: existingMenu.key, itemCount: existingMenu.items.length } : null;
    const menu = existingMenu ? navigationRepository.update(existingMenu, input) : navigationRepository.create(input);
    workflowEventService.write({
      eventType: existingMenu ? "UPDATE" : "CREATE",
      actor: user,
      targetType: "NavigationMenu",
      targetId: menu.id,
      beforeState,
      afterState: { key: menu.key, itemCount: menu.items.length }
    });
    return menu;
  }
}

export const navigationService = new NavigationService();
