import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { BoardInput, BoardResponse, BoardType, Role } from '../api/communityCreationClient';

interface BoardListEditorProps {
  boards: BoardResponse[];
  saving: boolean;
  onSave: (boards: BoardInput[]) => Promise<void>;
  onNext: () => void;
}

const boardTypes: BoardType[] = ['GENERAL', 'NOTICE', 'QNA', 'MEDIA'];
const roles: Role[] = ['MEMBER', 'MODERATOR', 'OWNER'];

export function BoardListEditor({ boards, saving, onSave, onNext }: BoardListEditorProps) {
  const [draftBoards, setDraftBoards] = useState<BoardInput[]>(
    boards.length
      ? boards
      : [
          {
            name: '자유게시판',
            description: '자유롭게 글을 나누는 기본 게시판',
            type: 'GENERAL',
            postPermission: 'MEMBER',
            commentPermission: 'MEMBER',
            displayOrder: 1
          },
          {
            name: '공지',
            description: '운영 공지와 필수 안내',
            type: 'NOTICE',
            postPermission: 'MODERATOR',
            commentPermission: 'MEMBER',
            displayOrder: 2
          }
        ]
  );

  function updateBoard(index: number, patch: Partial<BoardInput>) {
    setDraftBoards((current) => current.map((board, boardIndex) => (boardIndex === index ? { ...board, ...patch } : board)));
  }

  async function saveAndContinue() {
    await onSave(draftBoards.map((board, index) => ({ ...board, displayOrder: index + 1 })));
    onNext();
  }

  return (
    <section className="editor-stack">
      <div className="toolbar-row">
        <strong>초기 게시판</strong>
        <button
          className="icon-text-button"
          type="button"
          onClick={() =>
            setDraftBoards([
              ...draftBoards,
              {
                name: '',
                description: '',
                type: 'GENERAL',
                postPermission: 'MEMBER',
                commentPermission: 'MEMBER',
                displayOrder: draftBoards.length + 1
              }
            ])
          }
        >
          <Plus size={16} aria-hidden="true" />
          추가
        </button>
      </div>

      <div className="data-grid boards-grid">
        <span>이름</span>
        <span>유형</span>
        <span>글쓰기</span>
        <span>댓글</span>
        <span aria-label="삭제" />
        {draftBoards.map((board, index) => (
          <div className="grid-row" key={`${board.name}-${index}`}>
            <input value={board.name} onChange={(event) => updateBoard(index, { name: event.target.value })} placeholder="게시판 이름" />
            <select value={board.type} onChange={(event) => updateBoard(index, { type: event.target.value as BoardType })}>
              {boardTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <select value={board.postPermission} onChange={(event) => updateBoard(index, { postPermission: event.target.value as Role })}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <select value={board.commentPermission} onChange={(event) => updateBoard(index, { commentPermission: event.target.value as Role })}>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            <button
              className="icon-button"
              type="button"
              onClick={() => setDraftBoards(draftBoards.filter((_, itemIndex) => itemIndex !== index))}
              aria-label="게시판 삭제"
              disabled={draftBoards.length === 1}
            >
              <Trash2 size={17} />
            </button>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="primary-button" type="button" disabled={saving} onClick={() => void saveAndContinue()}>
          <Save size={17} aria-hidden="true" />
          저장 후 다음
        </button>
      </div>
    </section>
  );
}
