import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../stores/auth-store";

export function ProtectedRoute() {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const profile = useAuthStore((state) => state.profile);
  const loadScreenContext = useAuthStore((state) => state.loadScreenContext);

  useEffect(() => {
    if (token && !profile) {
      void loadScreenContext().catch(() => undefined);
    }
  }, [loadScreenContext, profile, token]);

  if (!token) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
