import { Link } from "react-router-dom";
import type { Notice } from "../types";

export function NoticeTable({
  items,
  setSort,
}: {
  items: Notice[];
  setSort: (sort: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th onClick={() => setSort("title")}>제목</th>
            <th onClick={() => setSort("created_at")}>작성일</th>
            <th onClick={() => setSort("view_count")}>조회수</th>
          </tr>
        </thead>
        <tbody>
          {items.map((notice) => (
            <tr key={notice.id}>
              <td>
                <Link
                  className="font-semibold text-[#222222] transition-colors duration-200 hover:text-[#4BC8C4]"
                  to={`/notices/${notice.id}`}
                >
                  {notice.title}
                </Link>
                {!notice.published && (
                  <span className="ml-2 badge">비공개</span>
                )}
              </td>
              <td>{notice.created_at?.slice(0, 10)}</td>
              <td>{notice.view_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
