export const postValidationMessages = {
  loginRequired: '로그인 후 이용할 수 있습니다.',
  titleRequired: '제목을 2자 이상 입력해주세요.',
  bodyRequired: '본문을 입력해주세요.',
  categoryInvalid: '게시판에서 제공하는 말머리를 선택해주세요.',
  commentRequired: '댓글 내용을 입력해주세요.',
  duplicateReport: '이미 같은 사유로 접수된 신고가 있습니다.',
  forbidden: '현재 계정으로 처리할 수 없는 요청입니다.'
};

export function InlineValidationMessage({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <p className="validation-message" role="alert">
      {message}
    </p>
  );
}
