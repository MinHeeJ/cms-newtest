import { Route, Routes } from "react-router-dom";
import {
  AdminDashboard,
  AttachmentsAdmin,
  DocumentEditor,
  DocumentsAdmin,
  FolderAdmin,
  OperationsPage,
  ProjectPage,
} from "./pages/AdminPages";
import { PortalDocument, PortalHome, SearchPage } from "./pages/PortalPages";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<PortalHome />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/documents/:documentId" element={<PortalDocument />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/folders" element={<FolderAdmin />} />
      <Route path="/admin/documents" element={<DocumentsAdmin />} />
      <Route
        path="/admin/documents/:documentId/edit"
        element={<DocumentEditor />}
      />
      <Route
        path="/admin/documents/:documentId/attachments"
        element={<AttachmentsAdmin />}
      />
      <Route
        path="/admin/operations"
        element={<OperationsPage kind="audit" />}
      />
      <Route path="/admin/backups" element={<OperationsPage kind="backup" />} />
      <Route
        path="/admin/migrations"
        element={<OperationsPage kind="migration" />}
      />
      <Route
        path="/admin/project"
        element={<ProjectPage route="/admin/project" />}
      />
      <Route
        path="/admin/project/scope"
        element={<ProjectPage route="/admin/project/scope" />}
      />
      <Route
        path="/admin/project/staff"
        element={<ProjectPage route="/admin/project/staff" />}
      />
      <Route
        path="/admin/project/risks"
        element={<ProjectPage route="/admin/project/risks" />}
      />
      <Route
        path="/admin/project/deliverables"
        element={<ProjectPage route="/admin/project/deliverables" />}
      />
      <Route
        path="/admin/project/changes"
        element={<ProjectPage route="/admin/project/changes" />}
      />
    </Routes>
  );
}
