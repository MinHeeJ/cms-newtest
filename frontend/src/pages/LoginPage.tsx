import { LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { userMessage } from "../lib/error-messages";
import { useAuthStore } from "../stores/auth-store";
import { Button } from "../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui-components/card";
import { Input } from "../ui-components/input";
import { ErrorState } from "../components/common/ErrorState";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    try {
      const profile = await login(username, password);
      const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
      navigate(from ?? profile.defaultPath, { replace: true });
    } catch (err) {
      setError(userMessage(err));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl">CMS 로그인</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={submit}>
            <Input aria-label="아이디" value={username} onChange={(event) => setUsername(event.target.value)} />
            <Input aria-label="비밀번호" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            {error ? <ErrorState message={error} /> : null}
            <Button type="submit">
              <LogIn size={18} /> 로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
