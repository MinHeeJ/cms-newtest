import type { ContentItem, RoleName, User } from "./cmsTypes";

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

const permissionsByRole: Record<RoleName, Permission[]> = {
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

export function getPermissions(user: Pick<User, "roles">): Permission[] {
  return [...new Set(user.roles.flatMap((role) => permissionsByRole[role]))];
}

export function can(user: Pick<User, "roles">, permission: Permission): boolean {
  return getPermissions(user).includes(permission);
}

export function canEdit(user: User, content: ContentItem): boolean {
  return can(user, "content:edit:any") || (can(user, "content:edit:own") && content.author.id === user.id);
}
