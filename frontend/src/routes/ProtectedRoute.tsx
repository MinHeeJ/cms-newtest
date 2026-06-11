import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { LoadingState } from "../components/common/LoadingState";
import { useAuthStore } from "../stores/auth-store";

export function ProtectedRoute() {
  const location = useLocation();
  const token = useAuthStore((state) => state.token);
  const profile = useAuthStore((state) => state.profile);
  const loadScreenContext = useAuthStore((state) => state.loadScreenContext);
  const [loading, setLoading] = useState(Boolean(token && !profile));

  useEffect(() => {
    if (!token || profile) {
      setLoading(false);
      return;
    }
    loadScreenContext()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [token, profile, loadScreenContext]);

  if (!token) {
    return <Navigate replace to="/login" state={{ from: location }} />;
  }

  if (loading) {
    return <LoadingState />;
  }

  return <Outlet />;
}
