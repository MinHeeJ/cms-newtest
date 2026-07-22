import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../types";
import { LoadingSkeleton } from "./ui";

export function Guard({
  role,
  children,
}: {
  role?: Role;
  children: React.ReactNode;
}) {
  const { user, initializing } = useAuth();
  if (initializing) {
    return (
      <section className="container">
        <LoadingSkeleton rows={2} />
      </section>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/403" replace />;
  return <>{children}</>;
}
