import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Flame, MessageCircle, PenLine, ThumbsUp } from 'lucide-react';
import { errorMessage } from '../../services/apiClient';
import { Board, getBoard, listBoardPosts, listBoards, PostSummary } from '../posts/postApi';
import { SubscriptionControls } from './SubscriptionControls';

export function BoardFeedPage() {
  const { boardId } = useParams();
  const [boards, setBoards] = useState<Board[]>([]);
  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<PostSummary[]>([]);
  const [popularPosts, setPopularPosts] = useState<PostSummary[]>([]);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    listBoards()
      .then((page) => setBoards(page.content))
      .catch((error) => setMessage(errorMessage(error)));
  }, []);

  const activeBoardId = useMemo(() => boardId ?? boards[0]?.id, [boardId, boards]);

  useEffect(() => {
    if (!activeBoardId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      getBoard(activeBoardId),
      listBoardPosts(activeBoardId, sort, category || undefined),
      listBoardPosts(activeBoardId, 'popular')
    ])
      .then(([boardResponse, postPage, popularPage]) => {
        setBoard(boardResponse);
        setPosts(postPage.content);
        setPopularPosts(popularPage.content.slice(0, 8));
        setMessage('');
      })
      .catch((error) => setMessage(errorMessage(error)))
      .finally(() => setLoading(false));
  }, [activeBoardId, category, sort]);

  return (
    <main className="content-grid">
      <section className="board-directory" aria-label="게시판 목록">
        <div className="section-heading">
          <h2>게시판</h2>
        </div>
        {boards.map((item) => (
          <Link className={item.id === activeBoardId ? 'board-link active' : 'board-link'} to={`/boards/${item.id}`} key={item.id}>
            <strong>{item.name}</strong>
            <span>{item.description}</span>
          </Link>
        ))}
      </section>

      <section className="feed-panel">
        {loading ? (
          <FeedSkeleton />
        ) : message ? (
          <StateMessage title="불러오지 못했습니다" message={message} />
        ) : board ? (
          <>
            <div className="board-header">
              <div>
                <h1>{boardId ? board.name : '실시간 커뮤니티'}</h1>
                <p>{board.description}</p>
              </div>
              <div className="board-actions">
                <SubscriptionControls boardId={board.id} />
                <Link className="primary-button" to={`/write?boardId=${board.id}`}>
                  <PenLine size={16} /> 글쓰기
                </Link>
              </div>
            </div>

            <div className="category-tabs" role="tablist" aria-label="말머리">
              <button className={!category ? 'active' : ''} type="button" onClick={() => setCategory('')}>
                전체
              </button>
              {board.categoryOptions.map((option) => (
                <button className={category === option ? 'active' : ''} type="button" onClick={() => setCategory(option)} key={option}>
                  {option}
                </button>
              ))}
            </div>

            <div className="sort-tabs" aria-label="정렬">
              {[
                ['latest', '최신순'],
                ['popular', '인기순'],
                ['commented', '댓글순']
              ].map(([value, label]) => (
                <button className={sort === value ? 'active' : ''} type="button" onClick={() => setSort(value)} key={value}>
                  {label}
                </button>
              ))}
            </div>

            {!boardId && (
              <section className="popular-strip" aria-label="인기글">
                <div className="section-heading">
                  <h2>
                    <Flame size={18} /> 실시간 인기글
                  </h2>
                </div>
                {popularPosts.map((post, index) => (
                  <PostCompactRow post={post} rank={index + 1} key={post.id} />
                ))}
              </section>
            )}

            <section className="post-table" aria-label="게시글 목록">
              <div className="post-table-header">
                <span>말머리</span>
                <span>제목</span>
                <span>작성자</span>
                <span>반응</span>
                <span>조회</span>
              </div>
              {posts.length === 0 ? <StateMessage title="게시글이 없습니다" message="첫 글을 작성해보세요." /> : posts.map((post) => <PostRow post={post} key={post.id} />)}
            </section>
          </>
        ) : (
          <StateMessage title="게시판이 없습니다" message="관리자 화면에서 게시판을 생성해주세요." />
        )}
      </section>
    </main>
  );
}

function PostRow({ post }: { post: PostSummary }) {
  return (
    <Link className="post-row" to={`/posts/${post.id}`}>
      <span>
        {post.isNotice && <b className="badge notice">공지</b>}
        {post.isPinned && <b className="badge pinned">고정</b>}
        {post.category && <b className="badge">{post.category}</b>}
      </span>
      <strong>{post.title}</strong>
      <span>{post.authorNickname}</span>
      <span className="metric">
        <MessageCircle size={14} /> {post.commentCount}
        <ThumbsUp size={14} /> {post.reactionCount}
      </span>
      <span>{post.viewCount}</span>
    </Link>
  );
}

function PostCompactRow({ post, rank }: { post: PostSummary; rank: number }) {
  return (
    <Link className="compact-row" to={`/posts/${post.id}`}>
      <span className="rank">{rank}</span>
      <strong>{post.title}</strong>
      <span>{post.commentCount} 댓글</span>
    </Link>
  );
}

function FeedSkeleton() {
  return (
    <div className="skeleton-list" aria-label="로딩 중">
      {Array.from({ length: 8 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function StateMessage({ title, message }: { title: string; message: string }) {
  return (
    <div className="empty-state" role="status">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
