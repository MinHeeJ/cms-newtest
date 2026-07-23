import { operationsApi } from "../../api/operationsApi";
import { idOf, OperationScreen } from "./OperationScreen";

export function VerificationPage() {
  return (
    <OperationScreen
      title="담당자 인증 관리"
      subtitle="담당 범위의 미확인 실적만 인증·반려·취소하고 처리 의견과 근거를 보존합니다."
      group="확인·승인 관리"
      accent="bg-[#00AEEF]"
      filters={["상태", "조직", "대상자"]}
      loader={operationsApi.verifications}
      columns={[
        { key: "recordId", label: "실적ID" },
        { key: "ownerName", label: "대상자" },
        { key: "evaluationArea", label: "영역" },
        { key: "verificationStatus", label: "상태" },
        { key: "evidence", label: "근거요약" },
      ]}
      actions={[
        {
          label: "인증",
          run: (row) =>
            operationsApi.decideVerification(
              idOf(row, "recordId"),
              "CERTIFY",
              "근거 확인",
              "UI 증빙 확인",
            ),
        },
        {
          label: "반려",
          tone: "danger",
          run: (row) =>
            operationsApi.decideVerification(
              idOf(row, "recordId"),
              "REJECT",
              "보완 필요",
              "증빙 부족",
            ),
        },
        {
          label: "취소",
          tone: "flat",
          run: (row) =>
            operationsApi.decideVerification(
              idOf(row, "recordId"),
              "CANCEL_CERTIFICATION",
              "인증 취소",
              "재검토",
            ),
        },
      ]}
      resultHint="Decision Drawer: 처리구분, 의견, 근거 필수 입력 후 저장합니다."
    />
  );
}
