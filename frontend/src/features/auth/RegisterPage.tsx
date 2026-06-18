import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, KeyRound, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { ApiClientError } from "../../services/apiClient";
import { useAuth } from "./AuthContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const destination = useMemo(() => {
    const state = location.state as { from?: { pathname?: string } } | null;
    return state?.from?.pathname ?? "/";
  }, [location.state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError("비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setIsSubmitting(true);
    try {
      await register(username, password, passwordConfirm);
      navigate(destination, { replace: true });
    } catch (registerError) {
      if (registerError instanceof ApiClientError && registerError.status === 409) {
        setError("이미 사용 중인 아이디입니다.");
      } else if (registerError instanceof ApiClientError && registerError.status === 400) {
        setError(registerError.message);
      } else {
        setError("회원가입 요청을 처리하지 못했습니다. 잠시 후 다시 시도하세요.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] p-4 text-foreground dark:bg-dark md:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-ld bg-white shadow-[0_24px_80px_rgba(29,43,76,0.10)] dark:border-[#333f55] dark:bg-[#202b3d] lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative isolate hidden overflow-hidden bg-[#12213d] p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(19,222,185,0.30),transparent_26%),radial-gradient(circle_at_78%_22%,rgba(93,135,255,0.45),transparent_28%),linear-gradient(145deg,#12213d_0%,#1c2536_56%,#0b1324_100%)]" />
          <div className="absolute bottom-14 left-12 h-56 w-56 rounded-full border border-white/15" />
          <div className="absolute right-16 top-20 h-44 w-44 rounded-full bg-success/20 blur-3xl" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4 text-success" aria-hidden="true" />
                CMS 운영실 초대 없이 시작
              </div>
              <h1 className="mt-10 max-w-xl text-5xl font-semibold leading-tight tracking-[-0.04em]">
                새 운영자를 같은 편집 흐름에 연결합니다.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
                아이디와 비밀번호만으로 기본 VIEWER 계정을 만들고, 이후 사용자 관리에서 역할을 조정할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-4">
              {[
                { icon: KeyRound, label: "아이디 기반", text: "이메일 대신 운영자가 기억하기 쉬운 아이디로 접속" },
                { icon: ShieldCheck, label: "활성 계정", text: "생성 즉시 활성 상태와 기본 권한으로 세션 발급" },
                { icon: Layers3, label: "통일된 UI", text: "로그인과 같은 Tailwind 폼 패턴으로 작성" }
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
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-foreground dark:text-white">회원가입</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground dark:text-white/60">
                사용할 아이디와 비밀번호를 입력하면 CMS 운영 화면으로 바로 이동합니다.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="username">
                  아이디
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  className="form-control h-12 rounded-xl bg-white dark:bg-transparent"
                  placeholder="예: operator"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="password">
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="form-control h-12 rounded-xl bg-white dark:bg-transparent"
                  placeholder="비밀번호"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="passwordConfirm">
                  비밀번호 확인
                </label>
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  className="form-control h-12 rounded-xl bg-white dark:bg-transparent"
                  placeholder="비밀번호 확인"
                  autoComplete="new-password"
                  value={passwordConfirm}
                  onChange={(event) => setPasswordConfirm(event.target.value)}
                  required
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error" role="alert">
                  {error}
                </div>
              ) : null}

              <button className="button-base h-12 w-full rounded-xl bg-primary text-white hover:bg-primaryemphasis" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "계정 생성 중..." : "회원가입"}
                {isSubmitting ? null : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              </button>
              <p className="text-center text-sm text-muted-foreground dark:text-white/60">
                이미 계정이 있나요? <Link className="font-semibold text-primary hover:text-primaryemphasis" to="/login">로그인</Link>
              </p>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}
