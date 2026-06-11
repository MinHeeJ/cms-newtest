import { FormEvent, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { errorMessage } from '../../services/apiClient';
import { listBoards, Board, BoardVisibility, PostingPolicy } from '../posts/postApi';
import { BoardUpsertRequest, createBoard } from './adminApi';

const initialForm: BoardUpsertRequest = {
  slug: '',
  name: '',
  description: '',
  visibility: 'PUBLIC',
  postingPolicy: 'MEMBERS',
  categoryOptions: ['공지', '질문', '정보', '잡담'],
  sortOrder: 10,
  isArchived: false
};

export function BoardManagementPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [form, setForm] = useState<BoardUpsertRequest>(initialForm);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);

  async function load() {
    const page = await listBoards(0, 100);
    setBoards(page.content);
  }

  useEffect(() => {
    load().catch((error) => setMessage(errorMessage(error)));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage('');
    try {
      await createBoard(form);
      setForm(initialForm);
      await load();
      setMessage('게시판이 생성되었습니다.');
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="admin-layout two-column">
      <section className="admin-list">
        <div className="section-heading">
          <h1>게시판 관리</h1>
        </div>
        {boards.map((board) => (
          <article className="admin-row" key={board.id}>
            <strong>{board.name}</strong>
            <span>{board.slug}</span>
            <b className="badge">{board.visibility}</b>
            <small>{board.categoryOptions.join(', ')}</small>
          </article>
        ))}
      </section>
      <form className="admin-form" onSubmit={submit}>
        <h2>새 게시판</h2>
        <label>
          주소
          <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
        </label>
        <label>
          이름
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label>
          설명
          <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={4} />
        </label>
        <label>
          공개 범위
          <select value={form.visibility} onChange={(event) => setForm({ ...form, visibility: event.target.value as BoardVisibility })}>
            <option value="PUBLIC">공개</option>
            <option value="MEMBERS_ONLY">회원 전용</option>
            <option value="CLOSED">닫힘</option>
          </select>
        </label>
        <label>
          글쓰기 권한
          <select value={form.postingPolicy} onChange={(event) => setForm({ ...form, postingPolicy: event.target.value as PostingPolicy })}>
            <option value="MEMBERS">회원</option>
            <option value="MODERATORS">게시판 관리자</option>
            <option value="ADMINS">최고 관리자</option>
          </select>
        </label>
        <label>
          말머리
          <input
            value={form.categoryOptions.join(', ')}
            onChange={(event) =>
              setForm({
                ...form,
                categoryOptions: event.target.value.split(',').map((value) => value.trim()).filter(Boolean)
              })
            }
          />
        </label>
        <label className="switch-label">
          <input type="checkbox" checked={form.isArchived} onChange={(event) => setForm({ ...form, isArchived: event.target.checked })} />
          보관
        </label>
        {message && <p className="validation-message">{message}</p>}
        <button className="primary-button" type="submit" disabled={pending}>
          <Save size={16} /> 저장
        </button>
      </form>
    </main>
  );
}
