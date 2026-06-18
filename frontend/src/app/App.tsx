import { useLocation, useRoutes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AuthProvider } from "../features/auth/AuthContext";
import { appRoutes } from "./routes";

export function App() {
  const element = useRoutes(appRoutes);
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";

  return <AuthProvider>{isLoginRoute ? element : <AppShell>{element}</AppShell>}</AuthProvider>;
}
