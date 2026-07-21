import { AppRouter } from "./AppRouter";
import { Shell } from "./layout/Shell";

export default function App() {
  return (
    <Shell>
      <AppRouter />
    </Shell>
  );
}
