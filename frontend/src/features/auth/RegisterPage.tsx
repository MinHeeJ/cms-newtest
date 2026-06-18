import { CheckCircle2, ShieldCheck, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { PageHeader } from "../../components/layout/PageHeader";
import { InlineNotice } from "../../components/feedback/UIState";
import { ApiClientError } from "../../services/apiClient";
import type { User } from "../../services/cmsTypes";
import { authApi } from "./auth.api";

export function RegisterPage() {
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setCreatedUser(null);
    setIsSubmitting(true);

    try {
      const user = await authApi.register({ email, displayName });
      setCreatedUser(user);
      setEmail("");
      setDisplayName("");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("회원가입을 처리하지 못했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Account"
        title="회원가입"
        description="신규 운영자 계정을 생성합니다. 가입된 회원은 기본 관리자 권한으로 시작합니다."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="card-box">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-lightprimary text-primary">
              <UserPlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-foreground dark:text-white">계정 정보</h2>
              <p className="text-sm text-muted-foreground">이메일과 표시 이름만 입력하면 바로 관리자 권한이 부여됩니다.</p>
            </div>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-foreground dark:text-white">
              이메일
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-foreground dark:text-white">
              표시 이름
              <input
                className="form-control"
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="홍길동"
                autoComplete="name"
                required
              />
            </label>

            {error ? <InlineNotice tone="error">{error}</InlineNotice> : null}
            {createdUser ? (
              <InlineNotice tone="primary">
                <span className="inline-flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  {createdUser.displayName} 계정이 ADMIN 권한으로 생성되었습니다.
                </span>
              </InlineNotice>
            ) : null}

            <div className="flex justify-end">
              <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "가입 처리 중" : "회원가입"}
              </button>
            </div>
          </form>
        </section>

        <aside className="card-box h-fit bg-lightsecondary/60">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary dark:bg-white/10">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-foreground dark:text-white">기본 권한</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground dark:text-white/70">
            생성된 계정은 콘텐츠, 사용자, 설정을 모두 관리할 수 있는 ADMIN 역할을 가집니다.
          </p>
          <div className="mt-5 rounded-md border border-ld bg-white p-4 text-sm dark:border-[#333f55] dark:bg-dark">
            <p className="font-semibold text-primary">ADMIN</p>
            <p className="mt-1 text-muted-foreground">회원가입 완료 즉시 적용</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
