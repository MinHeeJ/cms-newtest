import { operationsApi } from "../../api/operationsApi";
import { OperationScreen } from "./OperationScreen";

export function BatchResultPage() {
  return (
    <OperationScreen
      title="처리 결과 조회"
      subtitle="일괄처리 작업별 총건수, 성공·실패·제외건수와 오류 상세를 read-only로 조회합니다."
      group="일괄처리 관리"
      accent="bg-[#8c6220]"
      filters={["batchId", "작업유형", "평가연도"]}
      loader={operationsApi.batchResults}
      columns={[
        { key: "batchId", label: "batchId" },
        { key: "jobType", label: "작업유형" },
        { key: "targetCondition", label: "대상조건" },
        { key: "status", label: "상태" },
        { key: "totalCount", label: "건수합계" },
        { key: "countInvariantValid", label: "합계검증" },
      ]}
      resultHint="Error Detail Drawer: 대상식별정보, errorCode, message를 batch_results에서 조회합니다."
    />
  );
}
