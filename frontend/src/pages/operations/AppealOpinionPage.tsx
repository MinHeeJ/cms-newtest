import { operationsApi } from "../../api/operationsApi";
import { idOf, OperationScreen } from "./OperationScreen";

export function AppealOpinionPage() {
  return (
    <OperationScreen
      title="이의신청 의견 관리"
      subtitle="신청내용, 신청자 의견, 검토자 의견과 처리결과를 한 건의 흐름으로 보존합니다."
      group="의견·반려 관리"
      accent="bg-[#ce96c9]"
      filters={["처리결과", "신청자"]}
      loader={operationsApi.appeals}
      columns={[
        { key: "appealId", label: "appealId" },
        { key: "applicationContent", label: "신청내용" },
        { key: "applicantOpinion", label: "신청자의견" },
        { key: "processingResult", label: "처리결과" },
        { key: "processedAt", label: "처리일시" },
      ]}
      actions={[
        {
          label: "검토",
          run: (row) =>
            operationsApi.reviewAppeal(
              idOf(row, "appealId"),
              "검토 완료",
              "PARTIAL",
            ),
        },
      ]}
      resultHint="Timeline: 신청자 의견 → 검토자 의견 → 최종 처리결과"
    />
  );
}
