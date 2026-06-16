import type { ContentItem, RoleName, User } from "../content/content.types.js";

export type Permission =
  | "content:create"
  | "content:edit:own"
  | "content:edit:any"
  | "content:submit"
  | "content:review"
  | "content:publish"
  | "content:archive"
  | "media:manage"
  | "media:read"
  | "taxonomy:manage"
  | "taxonomy:read"
  | "navigation:manage"
  | "navigation:read"
  | "users:manage"
  | "audit:read"
  | "dashboard:read";

export const permissionsByRole: Record<RoleName, Permission[]> = {
  ADMIN: [
    "content:create",
    "content:edit:own",
    "content:edit:any",
    "content:submit",
    "content:review",
    "content:publish",
    "content:archive",
    "media:manage",
    "media:read",
    "taxonomy:manage",
    "taxonomy:read",
    "navigation:manage",
    "navigation:read",
    "users:manage",
    "audit:read",
    "dashboard:read"
  ],
  EDITOR: [
    "content:create",
    "content:edit:own",
    "content:edit:any",
    "content:submit",
    "content:review",
    "content:publish",
    "content:archive",
    "media:manage",
    "media:read",
    "taxonomy:manage",
    "taxonomy:read",
    "navigation:manage",
    "navigation:read",
    "audit:read",
    "dashboard:read"
  ],
  AUTHOR: ["content:create", "content:edit:own", "content:submit", "media:manage", "media:read"],
  VIEWER: ["media:read", "taxonomy:read", "navigation:read", "dashboard:read"]
};

export function getPermissions(user: User): Permission[] {
  return [...new Set(user.roles.flatMap((role) => permissionsByRole[role]))];
}

export function hasPermission(user: User, permission: Permission): boolean {
  return getPermissions(user).includes(permission);
}

export function canEditContent(user: User, content: ContentItem): boolean {
  return hasPermission(user, "content:edit:any") || (hasPermission(user, "content:edit:own") && content.author.id === user.id);
}
