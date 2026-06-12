import { BookOpen, Loader2, LogIn } from "lucide-react";
import { FormEvent, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ErrorState } from "../components/common/ErrorState";
import { errorMessage } from "../lib/error-messages";
import { useAuthStore } from "../stores/auth-store";
import { Button } from "../ui-components/button";
import { CardDescription } from "../ui-components/card";
import { Input } from "../ui-components/input";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const profile = useAuthStore((state) => state.profile);
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
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
    <main className="relative grid h-svh container max-w-none grid-cols-1 items-center justify-center px-4 lg:grid-cols-2 lg:px-0">
      <section className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-4 py-8 sm:w-[30rem] sm:p-8">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <BookOpen className="size-5" />
            </span>
            <span className="text-xl font-medium">CMS 지식 포털</span>
          </div>
          <div className="mx-auto flex w-full max-w-sm flex-col justify-center space-y-4">
            <div className="flex flex-col space-y-2 text-start">
              <h1 className="text-lg font-semibold tracking-tight">CMS 로그인</h1>
              <CardDescription>계정 정보를 입력해 포털과 관리자 콘솔에 접근하세요.</CardDescription>
            </div>
            <form className="grid gap-3" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="username">아이디</label>
                <Input id="username" aria-label="아이디" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="password">비밀번호</label>
                <Input id="password" aria-label="비밀번호" autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
              </div>
              {error ? <ErrorState message={error} /> : null}
              <Button disabled={loading} type="submit">
                {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
                로그인
              </Button>
            </form>
            <p className="px-8 text-center text-sm text-muted-foreground">
              shadcn-admin 스타일의 간결한 관리자 UI입니다.
            </p>
          </div>
        </div>
      </section>
      <section className="relative h-full overflow-hidden bg-muted max-lg:hidden">
        <div className="absolute left-20 top-[15%] w-[42rem] select-none rounded-xl border bg-background p-4 shadow-2xl">
          <div className="mb-4 flex h-10 items-center justify-between rounded-lg border bg-card px-4">
            <span className="text-sm font-medium">CMS Dashboard</span>
            <span className="text-xs text-muted-foreground">Live preview</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {["문서 관리", "폴더 관리", "권한", "상태"].map((item) => (
              <div className="rounded-xl border bg-card p-5 shadow-sm" key={item}>
                <div className="mb-3 h-3 w-20 rounded bg-muted" />
                <div className="h-7 w-32 rounded bg-primary/15" />
                <p className="mt-3 text-sm text-muted-foreground">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border bg-card p-5 shadow-sm">
            <div className="mb-4 h-4 w-36 rounded bg-muted" />
            <div className="grid gap-2">
              {[72, 92, 58, 84].map((width) => (
                <div className="h-8 rounded-md bg-muted" key={width} style={{ width: `${width}%` }} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
