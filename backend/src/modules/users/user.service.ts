import { forbidden, notFound } from "../../api/middleware/error-handler.js";
import { workflowEventService } from "../audit/workflow-event.service.js";
import { hasPermission } from "../auth/permissions.js";
import type { RoleUpdateInput, User } from "../content/content.types.js";
import { userRepository } from "./user.repository.js";

export class UserService {
  list(query: Parameters<typeof userRepository.list>[0]) {
    return userRepository.list(query);
  }

  updateRoles(userId: string, input: RoleUpdateInput, actor: User): User {
    if (!hasPermission(actor, "users:manage")) {
      throw forbidden();
    }
    const target = userRepository.find(userId);
    if (!target) {
      throw notFound("사용자를 찾을 수 없습니다.");
    }
    const beforeState = { roles: target.roles };
    const updated = userRepository.updateRoles(target, input.roles);
    workflowEventService.write({
      eventType: "PERMISSION_CHANGE",
      actor,
      targetType: "User",
      targetId: updated.id,
      beforeState,
      afterState: { roles: updated.roles },
      comment: input.reason
    });
    return updated;
  }
}

export const userService = new UserService();
