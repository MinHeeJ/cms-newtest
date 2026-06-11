import axios from "axios";

export function userMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (message) {
      return message;
    }
    if (status === 401) return "로그인이 필요합니다.";
    if (status === 403) return "접근 권한이 없습니다.";
    if (status === 413) return "업로드 크기 제한을 초과했습니다.";
    if (status && status >= 500) return "서비스 처리 중 오류가 발생했습니다.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "요청 처리에 실패했습니다.";
}
