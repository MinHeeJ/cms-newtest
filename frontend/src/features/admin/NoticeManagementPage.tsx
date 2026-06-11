import { FormEvent, useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { errorMessage } from '../../services/apiClient';
import { Board, listBoards } from '../posts/postApi';
import { createNotice } from './adminApi';

export function NoticeManagementPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardId, setBoardId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [pinned, setPinned] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    listBoards(0, 100)
      .then((page) => {
        setBoards(page.content);
        setBoardId(page.content[0]?.id ?? '');
      })
      .catch((error) => setMessage(errorMessage(error)));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await createNotice(boardId, title, body, '공지', pinned);
      setTitle('');
      setBody('');
      setMessage('공지 등록이 완료되었습니다.');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  return (
    <main className="single-panel">
      <form className="admin-form wide" onSubmit={submit}>
        <div className="section-heading">
          <h1>
            <Megaphone size={20} /> 공지 관리
          </h1>
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
          제목
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <label>
          본문
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={10} />
        </label>
        <label className="switch-label">
          <input type="checkbox" checked={pinned} onChange={(event) => setPinned(event.target.checked)} />
          게시판 상단 고정
        </label>
        {message && <p className="validation-message">{message}</p>}
        <button className="primary-button" type="submit">
          등록
        </button>
      </form>
    </main>
  );
}
