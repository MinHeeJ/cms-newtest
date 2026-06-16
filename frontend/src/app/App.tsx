import { useRoutes } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { appRoutes } from "./routes";

export function App() {
  const element = useRoutes(appRoutes);
  return <AppShell>{element}</AppShell>;
}
