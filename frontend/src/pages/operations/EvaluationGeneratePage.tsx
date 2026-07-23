import { operationsApi } from "../../api/operationsApi";
import { OperationScreen } from "./OperationScreen";

export function EvaluationGeneratePage() {
  return (
    <OperationScreen
      title="평가자료 생성"
      subtitle="평가연도·영역·조직·대상자 조건에 맞는 원천 실적만 평가자료로 생성합니다."
      group="일괄처리 관리"
      accent="bg-[#0088CC]"
      filters={["평가연도", "평가영역", "조직", "대상자"]}
      loader={operationsApi.batchResults}
      columns={[
        { key: "batchId", label: "batchId" },
        { key: "jobType", label: "작업유형" },
        { key: "targetCondition", label: "대상조건" },
        { key: "status", label: "상태" },
        { key: "totalCount", label: "total" },
      ]}
      actions={[
        {
          label: "평가자료 생성 실행",
          run: () =>
            operationsApi.generate({
              evaluationYear: 2026,
              evaluationArea: "TEACHING",
              organizationIds: ["ORG-001"],
              targetUserIds: ["PROF-001"],
              generationCriteria: "UNCONFIRMED_ONLY",
            }),
        },
      ]}
      resultHint="Result Panel: batchId, total, success, failed, excluded를 표시합니다."
    />
  );
}
