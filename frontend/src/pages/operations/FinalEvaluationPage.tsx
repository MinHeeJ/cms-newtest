import { operationsApi } from "../../api/operationsApi";
import { idOf, OperationScreen } from "./OperationScreen";

export function FinalEvaluationPage() {
  return (
    <OperationScreen
      title="평가 확정·취소"
      subtitle="대상자별 최종평가를 권한 기반으로 확정하거나 사유 입력 후 취소합니다."
      group="일괄처리 관리"
      accent="bg-[#292929]"
      filters={["평가연도", "조직", "확정상태"]}
      loader={operationsApi.finalEvaluations}
      columns={[
        { key: "targetUserName", label: "대상자" },
        { key: "resultGrade", label: "최종평가결과" },
        { key: "finalScore", label: "점수" },
        { key: "confirmationStatus", label: "확정상태" },
        { key: "confirmedBy", label: "확정자" },
      ]}
      actions={[
        {
          label: "확정",
          run: (row) => operationsApi.confirmFinal(idOf(row, "evaluationId")),
        },
        {
          label: "취소",
          tone: "danger",
          run: (row) =>
            operationsApi.cancelFinal(
              idOf(row, "evaluationId"),
              "위원회 재검토",
            ),
        },
      ]}
      notice="권한 없는 action은 403 message로 차단됩니다."
    />
  );
}
