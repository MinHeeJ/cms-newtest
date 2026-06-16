import { createId, getDataStore, timestamp } from "../../persistence/database.js";
import type { NavigationItem, NavigationMenu, NavigationMenuInput } from "../content/content.types.js";

function mapItems(input: NavigationMenuInput["items"]): NavigationItem[] {
  return input
    .map((item) => ({
      id: item.id ?? createId(),
      label: item.label,
      targetType: item.targetType,
      targetId: item.targetId ?? null,
      url: item.url ?? null,
      parentId: item.parentId ?? null,
      sortOrder: item.sortOrder,
      isVisible: item.isVisible
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export class NavigationRepository {
  list(): NavigationMenu[] {
    return getDataStore().navigationMenus.map((menu) => ({
      ...menu,
      items: [...menu.items].sort((a, b) => a.sortOrder - b.sortOrder)
    }));
  }

  find(menuId: string): NavigationMenu | undefined {
    return getDataStore().navigationMenus.find((menu) => menu.id === menuId);
  }

  create(input: NavigationMenuInput): NavigationMenu {
    const createdAt = timestamp();
    const menu: NavigationMenu = {
      id: createId(),
      key: input.key,
      label: input.label,
      isActive: input.isActive,
      items: mapItems(input.items),
      createdAt,
      updatedAt: createdAt
    };
    getDataStore().navigationMenus.push(menu);
    return menu;
  }

  update(menu: NavigationMenu, input: NavigationMenuInput): NavigationMenu {
    menu.key = input.key;
    menu.label = input.label;
    menu.isActive = input.isActive;
    menu.items = mapItems(input.items);
    menu.updatedAt = timestamp();
    return menu;
  }
}

export const navigationRepository = new NavigationRepository();
