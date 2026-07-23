import type { RouteObject } from "react-router-dom";
import { Navigate, useRoutes } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { AppealOpinionPage } from "../pages/operations/AppealOpinionPage";
import { BatchResultPage } from "../pages/operations/BatchResultPage";
import { EvaluationDeletePage } from "../pages/operations/EvaluationDeletePage";
import { EvaluationGeneratePage } from "../pages/operations/EvaluationGeneratePage";
import { FinalEvaluationPage } from "../pages/operations/FinalEvaluationPage";
import { PaymentApprovalPage } from "../pages/operations/PaymentApprovalPage";
import { RejectionReasonPage } from "../pages/operations/RejectionReasonPage";
import { ScoreRecalculatePage } from "../pages/operations/ScoreRecalculatePage";
import { VerificationPage } from "../pages/operations/VerificationPage";

export const appRoutes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/", element: <Navigate to="/operations/verifications" replace /> },
  { path: "/operations/verifications", element: <VerificationPage /> },
  { path: "/operations/payment-approvals", element: <PaymentApprovalPage /> },
  { path: "/operations/rejection-reasons", element: <RejectionReasonPage /> },
  { path: "/operations/appeal-opinions", element: <AppealOpinionPage /> },
  {
    path: "/operations/evaluation-generate",
    element: <EvaluationGeneratePage />,
  },
  { path: "/operations/evaluation-delete", element: <EvaluationDeletePage /> },
  { path: "/operations/score-recalculate", element: <ScoreRecalculatePage /> },
  { path: "/operations/final-evaluations", element: <FinalEvaluationPage /> },
  { path: "/operations/batch-results", element: <BatchResultPage /> },
  { path: "*", element: <Navigate to="/operations/verifications" replace /> },
];

export function AppRouter() {
  return useRoutes(appRoutes);
}
