import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Bookmark, Flag, MessageCircle, Reply, ThumbsUp } from 'lucide-react';
import { errorMessage, getStoredMember } from '../../services/apiClient';
import { ReportDialog } from '../moderation/ReportDialog';
import {
  bookmarkPost,
  Comment,
  createComment,
  getPost,
  listComments,
  PostDetail,
  ReactionType,
  reactToPost,
  removeBookmark,
  removeReaction
} from './postApi';
import { InlineValidationMessage, postValidationMessages } from './PostValidationMessages';

const reactionLabels: Record<ReactionType, string> = {
  LIKE: '좋아요',
  FUN: '재밌어요',
  INSIGHTFUL: '유익해요'
};

export function PostDetailPage() {
  const { postId = '' } = useParams();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentBody, setCommentBody] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCommentId, setReportCommentId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const member = getStoredMember();

  async function load() {
    try {
      const [postResponse, commentPage] = await Promise.all([getPost(postId), listComments(postId)]);
      setPost(postResponse);
      setComments(commentPage.content);
      setMessage('');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  useEffect(() => {
    if (postId) {
      load();
    }
  }, [postId]);

  const commentTree = useMemo(() => {
    const parents = comments.filter((comment) => !comment.parentCommentId);
    const children = comments.filter((comment) => comment.parentCommentId);
    return parents.map((parent) => ({
      parent,
      replies: children.filter((child) => child.parentCommentId === parent.id)
    }));
  }, [comments]);

  async function submitComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!member) {
      setMessage(postValidationMessages.loginRequired);
      return;
    }
    if (!commentBody.trim()) {
      setMessage(postValidationMessages.commentRequired);
      return;
    }
    try {
      await createComment(postId, commentBody, replyTo);
      setCommentBody('');
      setReplyTo(null);
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  async function react(type: ReactionType) {
    if (!member) {
      setMessage(postValidationMessages.loginRequired);
      return;
    }
    try {
      const summary = post?.currentMemberReaction === type ? await removeReaction(postId) : await reactToPost(postId, type);
      if (post) {
        const total = Object.values(summary.counts).reduce((sum, count) => sum + (count ?? 0), 0);
        setPost({ ...post, reactionCount: total, currentMemberReaction: summary.currentMemberReaction ?? null });
      }
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  async function toggleBookmark() {
    if (!member) {
      setMessage(postValidationMessages.loginRequired);
      return;
    }
    try {
      if (bookmarked) {
        await removeBookmark(postId);
      } else {
        await bookmarkPost(postId);
      }
      setBookmarked(!bookmarked);
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  if (message && !post) {
    return (
      <main className="state-page">
        <h1>게시글을 불러오지 못했습니다</h1>
        <p>{message}</p>
      </main>
    );
  }

  if (!post) {
    return (
      <main className="state-page">
        <h1>게시글 로딩 중</h1>
      </main>
    );
  }

  return (
    <main className="detail-layout">
      <article className="post-detail">
        <nav className="breadcrumb" aria-label="게시글 위치">
          <Link to={`/boards/${post.boardId}`}>{post.boardName}</Link>
          {post.category && <span>{post.category}</span>}
        </nav>
        <header className="post-detail-header">
          <div>
            <h1>{post.title}</h1>
            <p>
              {post.authorNickname} · 조회 {post.viewCount} · 댓글 {post.commentCount}
            </p>
          </div>
          <button className="secondary-button" type="button" onClick={() => setReportOpen(true)}>
            <Flag size={16} /> 신고
          </button>
        </header>
        <div className="post-body">{post.body}</div>
        <div className="reaction-bar" aria-label="게시글 반응">
          {(Object.keys(reactionLabels) as ReactionType[]).map((type) => (
            <button className={post.currentMemberReaction === type ? 'active' : ''} type="button" onClick={() => react(type)} key={type}>
              <ThumbsUp size={16} /> {reactionLabels[type]}
            </button>
          ))}
          <button type="button" className={bookmarked ? 'active' : ''} onClick={toggleBookmark}>
            <Bookmark size={16} /> 스크랩
          </button>
        </div>
        <InlineValidationMessage message={message} />
      </article>

      <section className="comments-panel" aria-label="댓글">
        <div className="section-heading">
          <h2>
            <MessageCircle size={18} /> 댓글
          </h2>
        </div>
        {commentTree.length === 0 && <div className="empty-state">아직 댓글이 없습니다.</div>}
        {commentTree.map(({ parent, replies }) => (
          <div className="comment-group" key={parent.id}>
            <CommentItem comment={parent} onReply={() => setReplyTo(parent.id)} onReport={() => setReportCommentId(parent.id)} />
            {replies.map((reply) => (
              <CommentItem comment={reply} onReply={() => setReplyTo(parent.id)} onReport={() => setReportCommentId(reply.id)} key={reply.id} />
            ))}
          </div>
        ))}
        <form className="comment-form" onSubmit={submitComment}>
          {replyTo && (
            <button className="text-button" type="button" onClick={() => setReplyTo(null)}>
              답글 취소
            </button>
          )}
          <textarea value={commentBody} onChange={(event) => setCommentBody(event.target.value)} rows={4} placeholder="댓글을 입력하세요" />
          <button className="primary-button" type="submit">
            등록
          </button>
        </form>
      </section>

      <ReportDialog open={reportOpen} targetType="POST" targetId={post.id} onClose={() => setReportOpen(false)} />
      <ReportDialog open={!!reportCommentId} targetType="COMMENT" targetId={reportCommentId ?? ''} onClose={() => setReportCommentId(null)} />
    </main>
  );
}

function CommentItem({ comment, onReply, onReport }: { comment: Comment; onReply: () => void; onReport: () => void }) {
  return (
    <div className={comment.depth > 0 ? 'comment-item reply' : 'comment-item'}>
      <strong>{comment.authorNickname}</strong>
      <p>{comment.body}</p>
      <div>
        {comment.depth === 0 && (
          <button className="text-button" type="button" onClick={onReply}>
            <Reply size={14} /> 답글
          </button>
        )}
        <button className="text-button" type="button" onClick={onReport}>
          <Flag size={14} /> 신고
        </button>
      </div>
    </div>
  );
}
