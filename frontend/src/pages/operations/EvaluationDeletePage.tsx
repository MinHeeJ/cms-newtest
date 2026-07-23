import { operationsApi } from "../../api/operationsApi";
import { OperationScreen } from "./OperationScreen";

export function EvaluationDeletePage() {
  return (
    <OperationScreen
      title="평가자료 삭제"
      subtitle="생성 배치 기준으로 삭제대상을 미리보기하고 삭제사유 입력 후 soft delete 처리합니다."
      group="일괄처리 관리"
      accent="bg-[#ED207B]"
      filters={["평가연도", "평가영역", "generationBatchId"]}
      loader={operationsApi.deletePreview}
      columns={[
        { key: "materialId", label: "materialId" },
        { key: "targetUserName", label: "대상자" },
        { key: "generationBatchId", label: "생성배치" },
        { key: "deletable", label: "삭제가능여부" },
      ]}
      actions={[
        {
          label: "삭제 실행",
          tone: "danger",
          run: () => operationsApi.deleteMaterials("잘못 생성된 평가자료 정리"),
        },
      ]}
      notice="삭제사유 없이 실행하면 validation error가 반환되며 원천 실적은 변경하지 않습니다."
    />
  );
}
