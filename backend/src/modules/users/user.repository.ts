import { getDataStore, paginate, timestamp } from "../../persistence/database.js";
import type { RoleName, User, UserStatus } from "../content/content.types.js";

export class UserRepository {
  list(query: { role?: RoleName; status?: UserStatus; page?: number; pageSize?: number }) {
    const users = getDataStore().users.filter(
      (user) => (!query.role || user.roles.includes(query.role)) && (!query.status || user.status === query.status)
    );
    return paginate(users, query.page, query.pageSize);
  }

  find(userId: string): User | undefined {
    return getDataStore().users.find((user) => user.id === userId);
  }

  updateRoles(user: User, roles: RoleName[]): User {
    user.roles = roles;
    user.updatedAt = timestamp();
    return user;
  }
}

export const userRepository = new UserRepository();
