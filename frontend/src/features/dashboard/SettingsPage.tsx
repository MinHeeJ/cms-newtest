export function SettingsPage() {
  return (
    <section className="card-box">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="card-title">설정</h1>
          <p className="mt-1 text-sm text-muted-foreground">사이트 기본 설정을 관리합니다.</p>
        </div>
        <span className="rounded-full bg-lightprimary px-2.5 py-1 text-xs font-medium text-primary">ADMIN only</span>
      </div>
      <div className="rounded-md bg-background p-6 dark:bg-white/5">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="site-name">사이트명</label>
            <input id="site-name" className="form-control" defaultValue="Hermes CMS" />
            <p className="mt-2 text-xs text-muted-foreground">브라우저 제목과 공개 헤더에 사용됩니다.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="timezone">Timezone</label>
            <input id="timezone" className="form-control" defaultValue="UTC" />
            <p className="mt-2 text-xs text-muted-foreground">예약 게시와 감사 로그 기준 시간대입니다.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="locale">Locale</label>
            <input id="locale" className="form-control" defaultValue="ko-KR" />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground dark:text-white" htmlFor="homepage">Homepage content</label>
            <input id="homepage" className="form-control" defaultValue="첫 번째 CMS 소식" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button">저장</button>
        <button className="button-base border border-ld bg-transparent text-foreground hover:bg-lightprimary hover:text-primary dark:text-white" type="button">변경 취소</button>
      </div>
    </section>
  );
}
