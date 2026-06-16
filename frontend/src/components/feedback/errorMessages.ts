export const errorMessages: Record<string, string> = {
  BAD_REQUEST: "입력 값을 다시 확인해 주세요.",
  FORBIDDEN: "현재 역할로는 이 작업을 수행할 수 없습니다.",
  NOT_FOUND: "대상을 찾을 수 없습니다.",
  CONFLICT: "다른 변경 사항과 충돌했습니다. 최신 내용을 확인해 주세요.",
  VALIDATION_ERROR: "필수 조건을 만족하지 못했습니다.",
  INTERNAL_ERROR: "서비스 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요."
};

export function toUserErrorMessage(error: unknown): string {
  if (error instanceof Error && "code" in error) {
    const code = String((error as { code: string }).code);
    return errorMessages[code] ?? error.message;
  }
  return "요청을 처리하지 못했습니다.";
}
