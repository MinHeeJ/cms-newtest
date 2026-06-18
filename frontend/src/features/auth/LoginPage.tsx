import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, DatabaseZap, FileCheck2, KeyRound, Layers3, Search, Sparkles } from "lucide-react";
import { ApiClientError } from "../../services/apiClient";
import { useAuth } from "./AuthContext";
import { recoverCredentials, type CredentialRecoveryResult } from "./auth.api";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [recoveryEmail, setRecoveryEmail] = useState("admin@example.com");
  const [error, setError] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryResult, setRecoveryResult] = useState<CredentialRecoveryResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  const destination = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? "/";
  }, [location.state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email);
      navigate(destination, { replace: true });
    } catch (loginError) {
      if (loginError instanceof ApiClientError && loginError.status === 401) {
        setError("등록된 활성 사용자 이메일인지 확인하세요.");
      } else {
        setError("로그인 요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRecoverySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRecoveryError(null);
    setRecoveryResult(null);
    setIsRecovering(true);
    try {
      const result = await recoverCredentials({ email: recoveryEmail });
      setRecoveryResult(result);
    } catch (recoveryRequestError) {
      if (recoveryRequestError instanceof ApiClientError && recoveryRequestError.status === 404) {
        setRecoveryError("가입 시 입력한 활성 사용자 이메일을 찾을 수 없습니다.");
      } else {
        setRecoveryError("계정 찾기 요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요.");
      }
    } finally {
      setIsRecovering(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-4 text-foreground dark:bg-dark md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-ld bg-white shadow-[0_24px_80px_rgba(29,43,76,0.10)] dark:border-[#333f55] dark:bg-[#202b3d] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative isolate hidden overflow-hidden bg-[#12213d] p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(93,135,255,0.42),transparent_28%),radial-gradient(circle_at_75%_10%,rgba(19,222,185,0.28),transparent_24%),linear-gradient(145deg,#12213d_0%,#1c2536_52%,#0b1324_100%)]" />
          <div className="absolute left-12 top-28 h-72 w-72 animate-[pulse_6s_ease-in-out_infinite] rounded-full border border-white/15" />
          <div className="absolute bottom-12 right-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4 text-success" aria-hidden="true" />
                CMS 운영실 로그인
              </div>
              <h1 className="mt-10 max-w-xl text-5xl font-semibold leading-tight tracking-[-0.04em]">
                발행 흐름을 한 화면에서 정렬하는 편집 데스크.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
                저장된 사용자 계정으로 접속하면 콘텐츠, 미디어, 검토 대기열을 같은 UI 리듬 안에서 이어서 관리할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { icon: Layers3, label: "콘텐츠 구조", text: "분류와 내비게이션을 운영 맥락에 맞게 연결" },
                { icon: FileCheck2, label: "검토 흐름", text: "작성, 승인, 예약 게시 상태를 빠르게 확인" },
                { icon: DatabaseZap, label: "DB 사용자", text: "cms_users에 등록된 활성 사용자만 세션 생성" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.07] p-4 backdrop-blur transition-transform hover:-translate-y-1">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-success">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{item.label}</span>
                      <span className="mt-1 block text-sm leading-6 text-white/65">{item.text}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Basic CMS</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground dark:text-white">로그인</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground dark:text-white/60">
                DB에 등록된 활성 사용자 이메일을 입력하세요. 예: admin@example.com
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="email">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control h-12 rounded-xl bg-white dark:bg-transparent"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error" role="alert">
                  {error}
                </div>
              ) : null}

              <button className="button-base h-12 w-full rounded-xl bg-primary text-white hover:bg-primaryemphasis" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "로그인 중..." : "로그인"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <div className="my-8 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground dark:text-white/40">
              <span className="h-px flex-1 bg-ld dark:bg-white/10" />
              계정 찾기
              <span className="h-px flex-1 bg-ld dark:bg-white/10" />
            </div>

            <form className="rounded-2xl border border-ld bg-[#f8faff] p-5 shadow-[0_16px_40px_rgba(29,43,76,0.06)] dark:border-white/10 dark:bg-white/[0.04]" onSubmit={handleRecoverySubmit}>
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/20">
                  <KeyRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-[-0.02em] text-foreground dark:text-white">아이디/비밀번호 찾기</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground dark:text-white/60">
                    가입 시 입력한 이메일을 입력하면 로그인 아이디를 확인하고 비밀번호 초기화 안내를 받을 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="recovery-email">
                  가입 이메일
                </label>
                <input
                  id="recovery-email"
                  name="recovery-email"
                  type="email"
                  className="form-control h-12 rounded-xl bg-white dark:bg-transparent"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  value={recoveryEmail}
                  onChange={(event) => setRecoveryEmail(event.target.value)}
                  required
                />
              </div>

              {recoveryError ? (
                <div className="mt-4 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error" role="alert">
                  {recoveryError}
                </div>
              ) : null}

              {recoveryResult ? (
                <div className="mt-4 rounded-xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-foreground dark:text-white" role="status">
                  <p className="font-semibold">{recoveryResult.displayName}님의 로그인 아이디</p>
                  <p className="mt-1 font-mono text-primary">{recoveryResult.loginId}</p>
                  <p className="mt-2 leading-6 text-muted-foreground dark:text-white/60">{recoveryResult.passwordRecoveryMessage}</p>
                </div>
              ) : null}

              <button className="button-base mt-5 h-12 w-full rounded-xl border border-primary/25 bg-white text-primary hover:bg-primary hover:text-white dark:bg-transparent" type="submit" disabled={isRecovering}>
                {isRecovering ? "계정 확인 중..." : "이메일로 계정 찾기"}
                <Search className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
