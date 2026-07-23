import { operationsApi } from "../../api/operationsApi";
import { OperationScreen } from "./OperationScreen";

export function ScoreRecalculatePage() {
  return (
    <OperationScreen
      title="점수 재계산"
      subtitle="산식버전과 대상조건을 기준으로 지정 대상의 전후 점수 차이를 확인합니다."
      group="일괄처리 관리"
      accent="bg-[#31ceb7]"
      filters={["평가연도", "대상자", "영역", "formulaVersion"]}
      loader={operationsApi.batchResults}
      columns={[
        { key: "batchId", label: "batchId" },
        { key: "jobType", label: "작업유형" },
        { key: "status", label: "상태" },
        { key: "totalCount", label: "대상" },
      ]}
      actions={[
        { label: "재계산 실행", run: () => operationsApi.recalculate() },
      ]}
      resultHint="Before/After Table은 /api/evaluation-batches/{batchId}/score-diff 결과와 연결됩니다."
    />
  );
}
