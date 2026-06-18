import { useLocation, useRoutes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../features/auth/AuthContext";
import { appRoutes } from "./routes";

export function App() {
  const element = useRoutes(appRoutes);
  const location = useLocation();
  const { isLoading } = useAuth();
  const isLoginRoute = location.pathname === "/login";

  if (isLoginRoute) {
    return element;
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="card-box flex min-h-[320px] items-center justify-center text-sm text-muted-foreground dark:text-white/60">
          세션을 확인하는 중입니다...
        </div>
      </AppShell>
    );
  }

  return <AppShell>{element}</AppShell>;
}
