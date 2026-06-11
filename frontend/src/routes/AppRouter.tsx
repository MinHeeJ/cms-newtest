import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout";
import { PortalLayout } from "../components/layout/PortalLayout";
import { AdminHomePage } from "../pages/admin/AdminHomePage";
import { ArticleEditorPage } from "../pages/admin/ArticleEditorPage";
import { ArticleManagePage } from "../pages/admin/ArticleManagePage";
import { FolderManagePage } from "../pages/admin/FolderManagePage";
import { ArticleDetailPage } from "../pages/portal/ArticleDetailPage";
import { PortalHomePage } from "../pages/portal/PortalHomePage";
import { LoginPage } from "../pages/LoginPage";
import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";

function Forbidden() {
  return <main className="grid min-h-screen place-items-center p-6 text-center">접근 권한이 없습니다.</main>;
}

function NotFound() {
  return <main className="grid min-h-screen place-items-center p-6 text-center">요청한 화면을 찾을 수 없습니다.</main>;
}

export function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate replace to="/portal" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalHomePage />} />
            <Route path="articles/:articleId" element={<ArticleDetailPage />} />
          </Route>
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHomePage />} />
              <Route path="folders" element={<FolderManagePage />} />
              <Route path="articles" element={<ArticleManagePage />} />
              <Route path="articles/new" element={<ArticleEditorPage />} />
              <Route path="articles/:articleId/edit" element={<ArticleEditorPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
