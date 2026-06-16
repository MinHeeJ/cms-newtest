import type { FastifyReply, FastifyRequest } from "fastify";
import { forbidden } from "../../api/middleware/error-handler.js";
import { getDataStore } from "../../persistence/database.js";
import type { Permission } from "./permissions.js";
import { getPermissions, hasPermission } from "./permissions.js";
import type { User } from "../content/content.types.js";

declare module "fastify" {
  interface FastifyRequest {
    currentUser: User;
    currentPermissions: Permission[];
  }
}

function resolveUserFromRequest(request: FastifyRequest): User {
  const store = getDataStore();
  const headerRole = request.headers["x-cms-role"];
  const headerEmail = request.headers["x-cms-user"];
  const role = Array.isArray(headerRole) ? headerRole[0] : headerRole;
  const email = Array.isArray(headerEmail) ? headerEmail[0] : headerEmail;

  if (email) {
    const user = store.users.find((candidate) => candidate.email === email);
    if (user) {
      return user;
    }
  }

  if (role) {
    const user = store.users.find((candidate) => candidate.roles.includes(role as User["roles"][number]));
    if (user) {
      return user;
    }
  }

  return store.users[0];
}

export async function sessionMiddleware(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  request.currentUser = resolveUserFromRequest(request);
  request.currentPermissions = getPermissions(request.currentUser);
}

export function requirePermission(permission: Permission) {
  return async (request: FastifyRequest): Promise<void> => {
    if (!hasPermission(request.currentUser, permission)) {
      throw forbidden();
    }
  };
}
