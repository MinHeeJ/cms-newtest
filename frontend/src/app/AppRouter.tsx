import { Navigate, type RouteObject } from "react-router-dom";
import { AuditLogPage } from "../features/audit/AuditLogPage";
import { ContentEditorPage } from "../features/content/ContentEditorPage";
import { ContentListPage } from "../features/content/ContentListPage";
import { ReviewQueuePage } from "../features/content/ReviewQueuePage";
import { RevisionHistoryPage } from "../features/content/RevisionHistoryPage";
import { ScheduledContentPage } from "../features/content/ScheduledContentPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { SettingsPage } from "../features/dashboard/SettingsPage";
import { LoginPage } from "../features/auth/LoginPage";
import { MediaLibraryPage } from "../features/media/MediaLibraryPage";
import { NavigationBuilderPage } from "../features/navigation/NavigationBuilderPage";
import { TaxonomyManagerPage } from "../features/taxonomy/TaxonomyManagerPage";
import { UserRoleManagerPage } from "../features/users/UserRoleManagerPage";
import {
  AccessDeniedPage,
  PortalDocumentPage,
  PortalHomePage,
  PortalSearchPage,
} from "../features/portal/PortalPages";
import type { RoleName } from "../services/cmsTypes";

export type NavigationIcon =
  | "dashboard"
  | "content"
  | "editor"
  | "review"
  | "revision"
  | "media"
  | "taxonomy"
  | "navigation"
  | "users"
  | "audit"
  | "settings"
  | "boxes";

export interface NavigationItemConfig {
  label: string;
  path: string;
  icon: NavigationIcon;
  roles: RoleName[];
}

export const navigationGroups: Array<{
  label: string;
  items: NavigationItemConfig[];
}> = [
  {
    label: "Home",
    items: [
      {
        label: "Dashboard",
        path: "/",
        icon: "dashboard",
        roles: ["ADMIN", "EDITOR", "VIEWER"],
      },
    ],
  },
  {
    label: "Content",
    items: [
      {
        label: "전체 콘텐츠",
        path: "/content",
        icon: "content",
        roles: ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"],
      },
      {
        label: "새 콘텐츠",
        path: "/content/new",
        icon: "editor",
        roles: ["ADMIN", "EDITOR", "AUTHOR"],
      },
      {
        label: "검토 대기",
        path: "/review",
        icon: "review",
        roles: ["ADMIN", "EDITOR"],
      },
      {
        label: "Revision 이력",
        path: "/revisions",
        icon: "revision",
        roles: ["ADMIN", "EDITOR", "AUTHOR"],
      },
      {
        label: "예약 게시",
        path: "/scheduled",
        icon: "revision",
        roles: ["ADMIN", "EDITOR"],
      },
    ],
  },
  {
    label: "Operate",
    items: [
      {
        label: "미디어",
        path: "/media",
        icon: "media",
        roles: ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"],
      },
      {
        label: "분류",
        path: "/taxonomy",
        icon: "taxonomy",
        roles: ["ADMIN", "EDITOR"],
      },
      {
        label: "내비게이션",
        path: "/navigation",
        icon: "navigation",
        roles: ["ADMIN", "EDITOR"],
      },
      { label: "사용자", path: "/users", icon: "users", roles: ["ADMIN"] },
      {
        label: "감사 로그",
        path: "/audit",
        icon: "audit",
        roles: ["ADMIN", "EDITOR"],
      },
      { label: "설정", path: "/settings", icon: "settings", roles: ["ADMIN"] },
    ],
  },
];

export const appRoutes: RouteObject[] = [
  { path: "/login", element: <LoginPage /> },
  { path: "/portal", element: <PortalHomePage /> },
  { path: "/portal/search", element: <PortalSearchPage /> },
  { path: "/portal/documents/:documentId", element: <PortalDocumentPage /> },
  { path: "/access-denied", element: <AccessDeniedPage /> },
  { path: "/admin", element: <DashboardPage /> },
  { path: "/admin/content", element: <ContentListPage /> },
  { path: "/admin/content/documents/new", element: <ContentEditorPage /> },
  {
    path: "/admin/content/documents/:documentId/edit",
    element: <ContentEditorPage />,
  },
  {
    path: "/admin/content/documents/:documentId/attachments",
    element: <MediaLibraryPage />,
  },
  { path: "/admin/operations", element: <AuditLogPage /> },
  { path: "/admin/project/:area", element: <SettingsPage /> },
  { path: "/", element: <DashboardPage /> },
  { path: "/content", element: <ContentListPage /> },
  { path: "/content/new", element: <ContentEditorPage /> },
  { path: "/content/:contentId/edit", element: <ContentEditorPage /> },
  { path: "/content/:contentId/revisions", element: <RevisionHistoryPage /> },
  { path: "/revisions", element: <RevisionHistoryPage /> },
  { path: "/review", element: <ReviewQueuePage /> },
  { path: "/scheduled", element: <ScheduledContentPage /> },
  { path: "/media", element: <MediaLibraryPage /> },
  { path: "/taxonomy", element: <TaxonomyManagerPage /> },
  { path: "/navigation", element: <NavigationBuilderPage /> },
  { path: "/users", element: <UserRoleManagerPage /> },
  { path: "/audit", element: <AuditLogPage /> },
  { path: "/settings", element: <SettingsPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
];
