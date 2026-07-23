import { describe, expect, it } from "vitest";
import { appRoutes, navigationGroups } from "../app/routes";

const requiredRoutes = [
  "/operations/verifications",
  "/operations/payment-approvals",
  "/operations/rejection-reasons",
  "/operations/appeal-opinions",
  "/operations/evaluation-generate",
  "/operations/evaluation-delete",
  "/operations/score-recalculate",
  "/operations/final-evaluations",
  "/operations/batch-results",
];

describe("operations route inventory", () => {
  it("registers every ui-design screen route without redirect-only placeholders", () => {
    const routePaths = appRoutes.map((route) => route.path);
    expect(routePaths).toEqual(expect.arrayContaining(requiredRoutes));
    for (const path of requiredRoutes) {
      const route = appRoutes.find((candidate) => candidate.path === path);
      expect(route?.element).toBeTruthy();
    }
  });

  it("exposes sidebar navigation groups from the common operations menu", () => {
    const labels = navigationGroups.flatMap((group) =>
      group.items.map((item) => item.label),
    );
    expect(labels).toEqual(
      expect.arrayContaining([
        "담당자 인증 관리",
        "지급승인 관리",
        "반려사유 관리",
        "이의신청 의견 관리",
        "평가자료 생성",
        "평가자료 삭제",
        "점수 재계산",
        "평가 확정·취소",
        "처리 결과 조회",
      ]),
    );
  });
});
