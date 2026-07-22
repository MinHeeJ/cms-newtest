import { Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/Layout";
import { Guard } from "./components/Guard";
import { ErrorPage } from "./components/ui";
import { Home } from "./pages/Home";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import { NoticesPage } from "./pages/NoticesPage";
import { NoticeDetailPage } from "./pages/NoticeDetailPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { MyPage } from "./pages/MyPage";
import { AdminNoticesPage } from "./pages/AdminNoticesPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/notices" element={<NoticesPage />} />
        <Route path="/notices/:id" element={<NoticeDetailPage />} />
        <Route
          path="/notifications"
          element={
            <Guard>
              <NotificationsPage />
            </Guard>
          }
        />
        <Route
          path="/mypage"
          element={
            <Guard>
              <MyPage />
            </Guard>
          }
        />
        <Route
          path="/admin/notices"
          element={
            <Guard role="ADMIN">
              <AdminNoticesPage />
            </Guard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <Guard role="ADMIN">
              <AdminUsersPage />
            </Guard>
          }
        />
        <Route
          path="/403"
          element={<ErrorPage code="403" message="권한이 없습니다" />}
        />
        <Route
          path="/404"
          element={<ErrorPage code="404" message="페이지를 찾을 수 없습니다" />}
        />
        <Route
          path="/500"
          element={<ErrorPage code="500" message="서버 오류가 발생했습니다" />}
        />
        <Route
          path="*"
          element={<ErrorPage code="404" message="페이지를 찾을 수 없습니다" />}
        />
      </Route>
    </Routes>
  );
}
