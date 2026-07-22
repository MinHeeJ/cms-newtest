import { FormEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { client } from "../api";
import { useAuth } from "../auth/AuthContext";
import {
  Empty,
  ErrorState,
  LoadingSkeleton,
  PageTitle,
  Toast,
} from "../components/ui";
import type { Comment, Notice } from "../types";

export function NoticeDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    Promise.all([client.notice(id), client.comments(id)])
      .then(([noticeData, commentsPage]) => {
        setNotice(noticeData);
        setComments(commentsPage.items);
      })
      .catch((err: any) => {
        setNotice(null);
        setComments([]);
        setError(err.message || "공지를 불러오지 못했습니다.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await client.createComment(id, content);
    setContent("");
    setToast("댓글이 등록되었습니다");
    load();
  };

  return (
    <>
      <PageTitle title="공지 상세" />
      <section className="container">
        {loading ? (
          <LoadingSkeleton rows={2} />
        ) : error ? (
          <ErrorState message={error} retry={load} />
        ) : notice ? (
          <article className="base-card">
            <span className="badge mb-[21px]">공지</span>
            <h2 className="text-2xl font-bold lg:text-[32px]">
              {notice.title}
            </h2>
            <p className="mt-2 text-[#888888]">
              작성자 {notice.author_nickname || notice.author_id} · 조회{" "}
              {notice.view_count} · {notice.created_at?.slice(0, 10)}
            </p>
            <div className="mt-[33px] whitespace-pre-wrap rounded-[11px] bg-[#F9F9F9] p-[19px] text-[#666666] lg:p-[33px]">
              {notice.content}
            </div>
          </article>
        ) : (
          <Empty title="공지를 찾을 수 없습니다" />
        )}
        <div className="mt-[33px] base-card">
          <h3 className="mb-[21px] text-xl font-bold">댓글</h3>
          {comments.length ? (
            <div className="divide-y divide-[#EEEEEE]">
              {comments.map((comment) => (
                <div className="py-4" key={comment.id}>
                  <b className="text-[#222222]">
                    {comment.author_nickname || comment.author_id}
                  </b>
                  <p className="mt-2 text-[#666666]">{comment.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty
              title="등록된 댓글이 없습니다"
              description="첫 댓글을 남겨보세요."
            />
          )}
          {user ? (
            <form onSubmit={submit} className="mt-[21px]">
              <textarea
                className="textarea"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="댓글을 입력하세요"
              />
              <button className="btn-primary mt-3" disabled={!content}>
                댓글 등록
              </button>
            </form>
          ) : (
            <p className="mt-4 rounded-[11px] bg-[#F9F9F9] p-[19px] text-[#888888]">
              로그인 후 댓글을 남길 수 있습니다.
            </p>
          )}
        </div>
      </section>
      <Toast msg={toast} />
    </>
  );
}
