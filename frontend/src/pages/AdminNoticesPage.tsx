import { FormEvent, useEffect, useState } from "react";
import { client } from "../api";
import { NoticeTable } from "../components/NoticeTable";
import {
  ConfirmModal,
  Empty,
  ErrorState,
  Field,
  LoadingSkeleton,
  PageTitle,
  Toast,
} from "../components/ui";
import type { Notice } from "../types";

export function AdminNoticesPage() {
  const [items, setItems] = useState<Notice[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [published, setPublished] = useState(true);
  const [toast, setToast] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    client
      .notices({ size: 100 })
      .then((page) => setItems(page.items))
      .catch((err: any) =>
        setError(err.message || "공지 목록을 불러오지 못했습니다."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    await client.saveNotice({ title, content, published });
    setTitle("");
    setContent("");
    setToast("공지가 등록되었습니다");
    load();
  };

  const deleteNotice = async () => {
    if (!deleteTarget) return;
    await client.deleteNotice(deleteTarget.id);
    setToast("공지가 삭제되었습니다");
    setDeleteTarget(null);
    load();
  };

  return (
    <>
      <PageTitle
        title="공지 관리"
        helper="공지 등록, 공개 상태 확인, 삭제를 처리합니다."
      />
      <section className="container">
        <form onSubmit={save} className="base-card mb-[33px]">
          <div className="mb-[21px] flex items-center justify-between">
            <h2 className="text-[22px] font-bold text-[#222222]">새 공지</h2>
            <span className="badge">ADMIN</span>
          </div>
          <Field label="제목" required value={title} onChange={setTitle} />
          <textarea
            className="textarea"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="내용 *"
          />
          <label className="mt-3 flex items-center gap-2 text-[#666666]">
            <input
              className="h-4 w-4 accent-[#4BC8C4]"
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
            />{" "}
            공개
          </label>
          <button className="btn-primary mt-4" disabled={!title || !content}>
            새 공지
          </button>
        </form>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : error ? (
          <ErrorState message={error} retry={load} />
        ) : items.length ? (
          <>
            <NoticeTable items={items} setSort={() => undefined} />
            <div className="mt-[21px] flex flex-wrap gap-2">
              {items.map((notice) => (
                <button
                  className="btn-secondary-sm"
                  key={notice.id}
                  onClick={() => setDeleteTarget(notice)}
                >
                  삭제: {notice.title}
                </button>
              ))}
            </div>
          </>
        ) : (
          <Empty
            title="관리할 공지가 없습니다"
            description="새 공지를 등록하면 관리 목록에 표시됩니다."
          />
        )}
      </section>
      <ConfirmModal
        open={!!deleteTarget}
        title="공지 삭제"
        description={`${deleteTarget?.title || "선택한 공지"}를 삭제하시겠습니까?`}
        confirmText="삭제"
        onConfirm={deleteNotice}
        onCancel={() => setDeleteTarget(null)}
      />
      <Toast msg={toast} />
    </>
  );
}
