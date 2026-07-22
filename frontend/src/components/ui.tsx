import { Link } from "react-router-dom";

export function PageTitle({
  title,
  helper,
}: {
  title: string;
  helper?: string;
}) {
  return (
    <section className="title-band">
      <div className="mx-auto max-w-[1000px]">
        <p className="mb-3 text-[15px] font-semibold uppercase tracking-[0.08em] text-[#4BC8C4]">
          NoticeBoard
        </p>
        <h1>{title}</h1>
        {helper && <p>{helper}</p>}
      </div>
    </section>
  );
}

export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="empty-card">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-[#4BC8C4] shadow-[0_8px_20px_rgba(0,0,0,0.06)]">
        ✦
      </div>
      <strong className="block text-[18px] font-bold text-[#222222]">
        {title}
      </strong>
      {description && <p className="mt-2 text-[#888888]">{description}</p>}
      {action && <div className="mt-[21px]">{action}</div>}
    </div>
  );
}

export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="empty-card border border-red-100 bg-red-50/50">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-2xl text-red-500">
        !
      </div>
      <strong className="block text-[18px] font-bold text-[#222222]">
        오류가 발생했습니다
      </strong>
      <p className="mt-2 text-[#666666]">{message}</p>
      {retry && (
        <button className="btn-secondary mt-[21px]" onClick={retry}>
          다시 시도
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-[21px]">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="base-card animate-pulse" key={index}>
          <div className="h-4 w-1/3 rounded bg-[#EEEEEE]" />
          <div className="mt-4 h-3 w-full rounded bg-[#F1F1F1]" />
          <div className="mt-3 h-3 w-2/3 rounded bg-[#F1F1F1]" />
        </div>
      ))}
    </div>
  );
}

export function Toast({ msg }: { msg: string }) {
  return msg ? (
    <div className="fixed bottom-8 left-1/2 z-[999] -translate-x-1/2 rounded-full bg-[#141414] px-6 py-3 text-white shadow-[0_8px_30px_rgba(0,0,0,0.22)] transition-opacity duration-300">
      {msg}
    </div>
  ) : null;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmText = "확인",
  cancelText = "취소",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 px-4">
      <div className="w-[500px] max-w-[calc(100vw-32px)] overflow-hidden rounded-[11px] bg-white shadow-[0_24px_108px_rgba(0,0,0,0.22)] transition-opacity duration-300">
        <div className="px-[33px] py-[33px] text-center">
          <h2 className="text-[22px] font-bold text-[#222222]">{title}</h2>
          <p className="mt-3 text-[#666666]">{description}</p>
        </div>
        <div className="grid grid-cols-2">
          <button
            className="h-[53px] bg-[#888888] font-semibold text-white transition-colors duration-200 hover:bg-[#666666]"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="h-[53px] bg-[#4BC8C4] font-semibold text-white transition-colors duration-200 hover:bg-[#0AA49F]"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  readOnly?: boolean;
}) {
  return (
    <label className="form-row">
      <span>
        {label} {required && <b className="text-[#4BC8C4]">*</b>}
      </span>
      <input
        className="input"
        readOnly={readOnly}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {required && !value && <em className="field-error">필수 입력입니다.</em>}
    </label>
  );
}

export function FormPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <PageTitle title={title} />
      <div className="mx-auto max-w-[480px] px-[27px] py-10 lg:py-[100px]">
        <div className="base-card">{children}</div>
      </div>
    </>
  );
}

export function ErrorPage({
  code,
  message,
}: {
  code: string;
  message: string;
}) {
  return (
    <>
      <PageTitle title={`${code} ${message}`} />
      <section className="container text-center">
        <div className="base-card mx-auto max-w-[560px]">
          <div className="mx-auto mb-[21px] flex h-16 w-16 items-center justify-center rounded-full bg-[#F9F9F9] text-[28px] font-bold text-[#4BC8C4]">
            {code}
          </div>
          <p className="mb-[33px] text-[#666666]">
            요청한 화면을 표시할 수 없습니다.
          </p>
          <Link className="btn-primary" to="/">
            홈으로
          </Link>
        </div>
      </section>
    </>
  );
}
