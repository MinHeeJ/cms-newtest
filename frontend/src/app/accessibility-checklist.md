# CMS Accessibility Checklist

- Sidebar, Header, table toolbar, editor, publish panel의 모든 interactive control은 keyboard focus가 보여야 한다.
- 상태는 색상만 쓰지 않고 `초안`, `검토 대기`, `게시`처럼 텍스트 badge를 함께 표시한다.
- 이미지 업로드 또는 대표 이미지 선택 후 공개 콘텐츠에 사용하기 전 `altText` 누락 상태를 표시한다.
- destructive action은 modal dialog로 영향 범위와 취소 경로를 제공한다.
- 콘텐츠 목록 table은 checkbox에 row title 기반 `aria-label`을 제공한다.
- 모바일 drawer는 닫기 버튼과 backdrop 닫기를 제공한다.
- Markdown preview의 외부 이미지 altText 경고를 작성 흐름 안에서 확인할 수 있어야 한다.
- 검토 반려 의견, 역할 변경 사유처럼 필수 복구 입력은 helper text로 요구 조건을 안내한다.
