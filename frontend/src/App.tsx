import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ArchivePage } from "./pages/ArchivePage";
import { IdeaCapturePage } from "./pages/IdeaCapturePage";
import { IdeaDetailPage } from "./pages/IdeaDetailPage";
import { IdeaListPage } from "./pages/IdeaListPage";
import { TagManagerPage } from "./pages/TagManagerPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<IdeaListPage />} />
        <Route path="/ideas" element={<IdeaListPage />} />
        <Route path="/ideas/new" element={<IdeaCapturePage />} />
        <Route path="/ideas/:ideaId" element={<IdeaDetailPage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/tags" element={<TagManagerPage />} />
        <Route path="*" element={<Navigate to="/ideas" replace />} />
      </Route>
    </Routes>
  );
}
