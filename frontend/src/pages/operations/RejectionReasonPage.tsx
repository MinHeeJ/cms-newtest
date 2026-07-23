import { operationsApi } from "../../api/operationsApi";
import { OperationScreen } from "./OperationScreen";

export function RejectionReasonPage() {
  return (
    <OperationScreen
      title="반려사유 관리"
      subtitle="업무유형별 표준 반려사유 코드와 추가 의견 허용 여부를 관리합니다."
      group="의견·반려 관리"
      accent="bg-[#25AAE2]"
      filters={["업무유형", "활성여부"]}
      loader={() => operationsApi.reasons()}
      columns={[
        { key: "businessType", label: "업무유형" },
        { key: "reasonCode", label: "reason_code" },
        { key: "standardMessage", label: "표준 문구" },
        { key: "allowAdditionalComment", label: "추가의견허용" },
      ]}
      form={{
        title: "표준 반려사유 등록",
        fields: [
          { name: "businessType", label: "업무유형*", placeholder: "PAYMENT" },
          { name: "reasonCode", label: "코드*", placeholder: "PAY-DOC" },
          {
            name: "standardMessage",
            label: "문구*",
            placeholder: "증빙 보완이 필요합니다.",
          },
          {
            name: "allowAdditionalComment",
            label: "추가 의견 허용",
            placeholder: "",
            type: "checkbox",
          },
        ],
        submitLabel: "저장",
        submit: operationsApi.createReason,
      }}
      resultHint="Preview: 반려 처리 화면에는 선택한 업무유형의 표준 사유만 표시됩니다."
    />
  );
}
