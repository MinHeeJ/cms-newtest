import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, DatabaseZap, FileCheck2, Layers3, Sparkles } from "lucide-react";
import { ApiClientError } from "../../services/apiClient";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          </div>
        </section>
      </div>
    </div>
  );
}
