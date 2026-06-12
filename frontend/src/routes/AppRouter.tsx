import { Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout";
import { PortalLayout } from "../components/layout/PortalLayout";
import { AdminHomePage } from "../pages/admin/AdminHomePage";
import { ArticleEditorPage } from "../pages/admin/ArticleEditorPage";
import { ArticleManagePage } from "../pages/admin/ArticleManagePage";
import { FolderManagePage } from "../pages/admin/FolderManagePage";
import { ForbiddenPage } from "../pages/ForbiddenPage";
import { LoginPage } from "../pages/LoginPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ArticleDetailPage } from "../pages/portal/ArticleDetailPage";
import { PortalHomePage } from "../pages/portal/PortalHomePage";
import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<Navigate replace to="/portal" />} path="/" />
      <Route element={<LoginPage />} path="/login" />
      <Route element={<ForbiddenPage />} path="/forbidden" />
      <Route element={<ProtectedRoute />}>
        <Route element={<PortalLayout />} path="/portal">
          <Route index element={<PortalHomePage />} />
          <Route element={<ArticleDetailPage />} path="articles/:articleId" />
        </Route>
      </Route>
      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />} path="/admin">
          <Route index element={<AdminHomePage />} />
          <Route element={<FolderManagePage />} path="folders" />
          <Route element={<ArticleManagePage />} path="articles" />
          <Route element={<ArticleEditorPage />} path="articles/new" />
          <Route element={<ArticleEditorPage />} path="articles/:articleId/edit" />
        </Route>
      </Route>
      <Route element={<NotFoundPage />} path="*" />
    </Routes>
  );
}
