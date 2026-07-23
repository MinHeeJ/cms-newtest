import { operationsApi } from "../../api/operationsApi";
import { idOf, OperationScreen } from "./OperationScreen";

export function PaymentApprovalPage() {
  return (
    <OperationScreen
      title="지급승인 관리"
      subtitle="신청금액·지급금액·계좌정보·업적연계를 확인하며 실제 금융거래는 실행하지 않습니다."
      group="확인·승인 관리"
      accent="bg-[#12A89D]"
      filters={["승인상태", "신청자"]}
      loader={operationsApi.payments}
      columns={[
        { key: "applicationId", label: "신청ID" },
        { key: "requestedAmount", label: "신청금액" },
        { key: "paymentAmount", label: "지급금액" },
        { key: "maskedAccount", label: "계좌마스킹" },
        { key: "linkedAchievement", label: "업적연계" },
        { key: "approvalStatus", label: "상태" },
      ]}
      actions={[
        {
          label: "승인",
          run: (row) =>
            operationsApi.decidePayment(
              idOf(row, "applicationId"),
              "APPROVE",
              "지급 요건 충족",
            ),
        },
        {
          label: "반려",
          tone: "danger",
          run: (row) =>
            operationsApi.decidePayment(
              idOf(row, "applicationId"),
              "REJECT",
              "증빙 보완 필요",
            ),
        },
        {
          label: "취소",
          tone: "flat",
          run: (row) =>
            operationsApi.decidePayment(
              idOf(row, "applicationId"),
              "CANCEL_APPROVAL",
              "승인 취소",
            ),
        },
      ]}
      notice="실제 계좌이체·회계전표·예산집행은 실행하지 않습니다."
    />
  );
}
