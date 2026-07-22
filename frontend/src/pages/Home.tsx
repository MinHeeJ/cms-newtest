import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client } from "../api";
import { Empty, ErrorState, LoadingSkeleton } from "../components/ui";
import type { Notice } from "../types";

export function Home() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .notices({ size: 3 })
      .then((page) => setNotices(page.items))
      .catch(() => setError("최신 공지를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-white">
        <div className="absolute left-1/2 top-16 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-[#4BC8C4]/10 blur-3xl lg:top-28 lg:h-[440px] lg:w-[440px]" />
        <div className="mx-auto flex h-[560px] max-w-[1000px] flex-col items-center justify-center px-[27px] text-center lg:h-[770px]">
          <p className="motion-up mb-3 text-[15px] font-semibold uppercase tracking-[0.08em] text-[#4BC8C4]">
            Community Notice Platform
          </p>
          <h1 className="text-[33px] font-bold leading-tight lg:text-[44px]">
            <span className="sr-only">커뮤니티 공지사항</span>
            커뮤니티 <span className="text-[#4BC8C4]">공지사항</span>을 빠르게
            <br className="hidden lg:block" /> 확인하세요
          </h1>
          <p className="mt-[21px] max-w-[640px] text-[16px] font-medium text-[#666666] lg:text-[18px]">
            관리자 공지, 사용자 댓글, 알림을 한 곳에서 관리하는 반응형 공지
            커뮤니케이션 화면입니다.
          </p>
          <div className="mt-[33px] flex flex-col gap-3 sm:flex-row">
            <Link className="btn-primary w-[213px] lg:w-[240px]" to="/notices">
              공지 보러가기
            </Link>
            <Link className="btn-secondary w-[213px] lg:w-[240px]" to="/signup">
              회원가입
            </Link>
          </div>
        </div>
      </section>
      <section className="bg-[#F9F9F9] py-[93px] lg:py-[160px]">
        <div className="mx-auto max-w-[1000px] px-[27px] lg:px-0">
          <div className="mb-[33px] text-center">
            <h2 className="text-[29px] font-bold text-[#222222] lg:text-[44px]">
              최신 <span className="text-[#4BC8C4]">공지</span>
            </h2>
            <p className="mt-[11px] text-[#888888]">
              중요 안내를 카드 형태로 빠르게 확인하세요.
            </p>
          </div>
          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : error ? (
            <ErrorState message={error} />
          ) : notices.length ? (
            <div className="grid gap-[21px] lg:grid-cols-3">
              {notices.map((notice) => (
                <Link
                  className="base-card group"
                  key={notice.id}
                  to={`/notices/${notice.id}`}
                >
                  <span className="badge mb-[21px]">공지</span>
                  <strong className="block text-[18px] font-bold transition-colors duration-200 group-hover:text-[#4BC8C4]">
                    {notice.title}
                  </strong>
                  <p className="mt-3 line-clamp-3 text-[#666666]">
                    {notice.content}
                  </p>
                  <p className="mt-[21px] text-sm text-[#AAAAAA]">
                    {notice.created_at?.slice(0, 10)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="등록된 공지사항이 없습니다"
              description="새 공지가 등록되면 이 영역에 표시됩니다."
            />
          )}
        </div>
      </section>
    </>
  );
}
