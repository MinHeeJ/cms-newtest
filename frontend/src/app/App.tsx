import { useLocation } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { useAuth } from "../features/auth/AuthContext";
import { AppRouter } from "./AppRouter";

export function App() {
  const location = useLocation();
  const { isLoading } = useAuth();
  const isLoginRoute = location.pathname === "/login";
  const element = <AppRouter />;

  if (isLoginRoute) {
    return element;
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="flex min-h-[320px] items-center justify-center rounded border border-zinc-200 bg-white p-8 text-sm text-zinc-500">
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          세션을 확인하는 중입니다...
        </div>
      </AppShell>
    );
  }

  return <AppShell>{element}</AppShell>;
}
