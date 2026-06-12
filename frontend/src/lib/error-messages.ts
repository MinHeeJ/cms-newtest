import type { AxiosError } from "axios";

const fallback = "요청 처리 중 오류가 발생했습니다.";

export function errorMessage(error: unknown) {
  const axiosError = error as AxiosError<{ error?: { code?: string; message?: string } }>;
  const code = axiosError.response?.data?.error?.code;
  const message = axiosError.response?.data?.error?.message;
  if (message) {
    return message;
  }
  if (code === "UNAUTHORIZED") {
    return "로그인이 필요합니다.";
  }
  if (code === "FORBIDDEN") {
    return "접근 권한이 없습니다.";
  }
  if (code === "UPLOAD_TOO_LARGE") {
    return "업로드 허용 용량을 초과했습니다.";
  }
  return fallback;
}
