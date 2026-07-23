import type { RoleName } from "../services/cmsTypes";
export { appRoutes } from "./AppRouter";

export type NavigationIcon =
  | "dashboard"
  | "content"
  | "editor"
  | "review"
  | "revision"
  | "media"
  | "taxonomy"
  | "navigation"
  | "users"
  | "audit"
  | "settings"
  | "boxes";

export interface NavigationItemConfig {
  label: string;
  path: string;
  icon: NavigationIcon;
  roles: RoleName[];
}

const allRoles: RoleName[] = ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"];

export const navigationGroups: Array<{
  label: string;
  items: NavigationItemConfig[];
}> = [
  {
    label: "확인·승인 관리",
    items: [
      {
        label: "담당자 인증 관리",
        path: "/operations/verifications",
        icon: "review",
        roles: allRoles,
      },
      {
        label: "지급승인 관리",
        path: "/operations/payment-approvals",
        icon: "audit",
        roles: allRoles,
      },
    ],
  },
  {
    label: "의견·반려 관리",
    items: [
      {
        label: "반려사유 관리",
        path: "/operations/rejection-reasons",
        icon: "taxonomy",
        roles: allRoles,
      },
      {
        label: "이의신청 의견 관리",
        path: "/operations/appeal-opinions",
        icon: "content",
        roles: allRoles,
      },
    ],
  },
  {
    label: "일괄처리 관리",
    items: [
      {
        label: "평가자료 생성",
        path: "/operations/evaluation-generate",
        icon: "boxes",
        roles: allRoles,
      },
      {
        label: "평가자료 삭제",
        path: "/operations/evaluation-delete",
        icon: "revision",
        roles: allRoles,
      },
      {
        label: "점수 재계산",
        path: "/operations/score-recalculate",
        icon: "settings",
        roles: allRoles,
      },
      {
        label: "평가 확정·취소",
        path: "/operations/final-evaluations",
        icon: "users",
        roles: allRoles,
      },
      {
        label: "처리 결과 조회",
        path: "/operations/batch-results",
        icon: "dashboard",
        roles: allRoles,
      },
    ],
  },
];
