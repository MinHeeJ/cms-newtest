import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { apiRequest, errorMessage, PageResponse } from '../../services/apiClient';
import { listBoards, Board, PostSummary } from '../posts/postApi';

export function SearchResultsPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState(params.get('q') ?? '');
  const [boardId, setBoardId] = useState(params.get('boardId') ?? '');
  const [sort, setSort] = useState(params.get('sort') ?? 'relevance');
  const [boards, setBoards] = useState<Board[]>([]);
  const [results, setResults] = useState<PostSummary[]>([]);
  const [message, setMessage] = useState('');
  const query = params.get('q') ?? '';

  useEffect(() => {
    listBoards()
      .then((page) => setBoards(page.content))
      .catch((error) => setMessage(errorMessage(error)));
  }, []);

  useEffect(() => {
    const currentQuery = params.get('q') ?? '';
    const currentBoard = params.get('boardId') ?? '';
    const currentSort = params.get('sort') ?? 'relevance';
    setKeyword(currentQuery);
    setBoardId(currentBoard);
    setSort(currentSort);
    if (currentQuery.length < 2) {
      setResults([]);
      return;
    }
    const searchParams = new URLSearchParams({ q: currentQuery, sort: currentSort, page: '0', size: '50' });
    if (currentBoard) {
      searchParams.set('boardId', currentBoard);
    }
    apiRequest<PageResponse<PostSummary>>(`/api/v1/search?${searchParams}`)
      .then((page) => {
        setResults(page.content);
        setMessage('');
      })
      .catch((error) => setMessage(errorMessage(error)));
  }, [params]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchParams = new URLSearchParams({ q: keyword, sort });
    if (boardId) {
      searchParams.set('boardId', boardId);
    }
    navigate(`/search?${searchParams}`);
  }

  return (
    <main className="single-panel">
      <form className="search-page-form" onSubmit={submit}>
        <Search size={18} />
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} aria-label="검색어" />
        <select value={boardId} onChange={(event) => setBoardId(event.target.value)} aria-label="게시판 필터">
          <option value="">전체 게시판</option>
          {boards.map((board) => (
            <option value={board.id} key={board.id}>
              {board.name}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="정렬">
          <option value="relevance">인기/정확도순</option>
          <option value="latest">최신순</option>
        </select>
        <button className="primary-button" type="submit">
          검색
        </button>
      </form>
      <section className="post-table">
        <div className="section-heading">
          <h1>검색 결과 {query && <span>{query}</span>}</h1>
        </div>
        {message && <p className="validation-message">{message}</p>}
        {results.length === 0 ? (
          <div className="empty-state">검색 결과가 없습니다.</div>
        ) : (
          results.map((post) => (
            <Link className="post-row search-row" to={`/posts/${post.id}`} key={post.id}>
              <span>{post.boardName}</span>
              <strong>{post.title}</strong>
              <span>{post.authorNickname}</span>
              <span>댓글 {post.commentCount}</span>
              <span>추천 {post.reactionCount}</span>
            </Link>
          ))
        )}
      </section>
    </main>
  );
}
