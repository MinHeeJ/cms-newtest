import { Navigate, Outlet } from "react-router-dom";
import { useEffect } from "react";
import { LoadingState } from "../components/common/LoadingState";
import { useAuthStore } from "../stores/auth-store";

export function AdminRoute() {
  const profile = useAuthStore((state) => state.profile);
  const token = useAuthStore((state) => state.token);
  const loadScreenContext = useAuthStore((state) => state.loadScreenContext);

  useEffect(() => {
    if (token && !profile) {
      void loadScreenContext().catch(() => undefined);
    }
  }, [loadScreenContext, profile, token]);

  if (!token) {
    return <Navigate replace to="/login" />;
  }

  if (!profile) {
    return <LoadingState label="권한 확인 중" />;
  }

  if (!profile?.adminAccess) {
    return <Navigate replace to="/forbidden" />;
  }

  return <Outlet />;
}
