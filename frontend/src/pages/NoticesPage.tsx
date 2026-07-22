import { useEffect, useState } from "react";
import { client } from "../api";
import { NoticeTable } from "../components/NoticeTable";
import {
  Empty,
  ErrorState,
  LoadingSkeleton,
  PageTitle,
} from "../components/ui";
import type { Notice } from "../types";

export function NoticesPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("created_at");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    client
      .notices({ keyword, sort })
      .then((page) => setItems(page.items))
      .catch((err: any) =>
        setError(err.message || "공지 목록을 불러오지 못했습니다."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [sort]);

  return (
    <>
      <PageTitle
        title="공지사항 목록"
        helper="제목·작성일·조회수 정렬과 검색을 지원합니다."
      />
      <section className="container">
        <div className="mb-[33px] rounded-[11px] bg-[#F9F9F9] p-[19px] lg:p-[33px]">
          <div className="flex flex-col gap-[21px] lg:flex-row">
            <input
              className="input"
              placeholder="제목+내용 검색"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
            />
            <button className="btn-primary shrink-0" onClick={load}>
              검색
            </button>
          </div>
        </div>
        {loading ? (
          <LoadingSkeleton rows={4} />
        ) : error ? (
          <ErrorState message={error} retry={load} />
        ) : items.length === 0 ? (
          <Empty
            title="등록된 공지사항이 없습니다"
            description="검색어를 변경하거나 새 공지가 등록될 때까지 기다려 주세요."
          />
        ) : (
          <NoticeTable items={items} setSort={setSort} />
        )}
      </section>
    </>
  );
}
