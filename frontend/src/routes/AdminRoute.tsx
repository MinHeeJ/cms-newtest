import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth-store";

export function AdminRoute() {
  const profile = useAuthStore((state) => state.profile);

  if (!profile?.adminAccess) {
    return <Navigate replace to="/forbidden" />;
  }

  return <Outlet />;
}
