import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { errorMessage } from "../lib/error-messages";
import { useAuthStore } from "../stores/auth-store";
import { Button } from "../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui-components/card";
import { Input } from "../ui-components/input";
import { ErrorState } from "../components/common/ErrorState";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const profile = useAuthStore((state) => state.profile);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      await login(username, password);
      const nextProfile = useAuthStore.getState().profile;
      const route = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? nextProfile?.defaultRoute ?? profile?.defaultRoute ?? "/portal";
      navigate(route, { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-[min(100%,420px)]">
        <CardHeader>
          <CardTitle>CMS 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <Input aria-label="아이디" value={username} onChange={(event) => setUsername(event.target.value)} />
            <Input aria-label="비밀번호" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {error ? <ErrorState message={error} /> : null}
            <Button type="submit">
              <LogIn size={18} />
              로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
