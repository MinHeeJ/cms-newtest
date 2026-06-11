import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send } from 'lucide-react';
import { errorMessage } from '../../services/apiClient';
import { Board, createPost, listBoards } from './postApi';
import { InlineValidationMessage, postValidationMessages } from './PostValidationMessages';

export function PostComposerPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState(params.get('boardId') ?? '');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    listBoards()
      .then((page) => {
        setBoards(page.content);
        if (!boardId && page.content[0]) {
          setBoardId(page.content[0].id);
        }
      })
      .catch((error) => setMessage(errorMessage(error)));
  }, [boardId]);

  const selectedBoard = useMemo(() => boards.find((board) => board.id === boardId), [boards, boardId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (title.trim().length < 2) {
      setMessage(postValidationMessages.titleRequired);
      return;
    }
    if (!body.trim()) {
      setMessage(postValidationMessages.bodyRequired);
      return;
    }
    setPending(true);
    setMessage('');
    try {
      const post = await createPost(boardId, { title, body, category });
      navigate(`/posts/${post.id}`);
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="editor-page">
      <form className="editor-panel" onSubmit={submit}>
        <div className="section-heading">
          <h1>게시글 작성</h1>
          <button className="primary-button" type="submit" disabled={pending}>
            <Send size={16} /> 등록
          </button>
        </div>
        <label>
          게시판
          <select value={boardId} onChange={(event) => setBoardId(event.target.value)}>
            {boards.map((board) => (
              <option value={board.id} key={board.id}>
                {board.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          말머리
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="">선택 안 함</option>
            {selectedBoard?.categoryOptions.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <label>
          제목
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} />
        </label>
        <label>
          본문
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={16} />
        </label>
        <InlineValidationMessage message={message} />
      </form>
    </main>
  );
}
