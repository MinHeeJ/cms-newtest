import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ModeratorInvitationInput, ModeratorInvitationResponse } from '../api/communityCreationClient';

interface ModeratorInviteInputProps {
  invitations: ModeratorInvitationResponse[];
  saving: boolean;
  onSave: (invitations: ModeratorInvitationInput[]) => Promise<void>;
  onNext: () => void;
}

export function ModeratorInviteInput({ invitations, saving, onSave, onNext }: ModeratorInviteInputProps) {
  const [draftInvitations, setDraftInvitations] = useState<ModeratorInvitationInput[]>(
    invitations.length ? invitations : [{ userIdentifier: '', message: '초기 운영진으로 함께해주세요.' }]
  );

  function updateInvitation(index: number, patch: Partial<ModeratorInvitationInput>) {
    setDraftInvitations((current) =>
      current.map((invitation, invitationIndex) => (invitationIndex === index ? { ...invitation, ...patch } : invitation))
    );
  }

  async function saveAndContinue() {
    await onSave(draftInvitations.filter((invitation) => invitation.userIdentifier.trim().length > 0));
    onNext();
  }

  return (
    <section className="editor-stack">
      <div className="toolbar-row">
        <strong>초기 운영진 초대</strong>
        <button className="icon-text-button" type="button" onClick={() => setDraftInvitations([...draftInvitations, { userIdentifier: '' }])}>
          <Plus size={16} aria-hidden="true" />
          추가
        </button>
      </div>

      {draftInvitations.map((invitation, index) => (
        <div className="invite-row" key={`${invitation.userIdentifier}-${index}`}>
          <input
            value={invitation.userIdentifier}
            onChange={(event) => updateInvitation(index, { userIdentifier: event.target.value })}
            placeholder="사용자 ID 또는 핸들"
          />
          <input
            value={invitation.message ?? ''}
            onChange={(event) => updateInvitation(index, { message: event.target.value })}
            placeholder="초대 메시지"
          />
          <button
            className="icon-button"
            type="button"
            onClick={() => setDraftInvitations(draftInvitations.filter((_, itemIndex) => itemIndex !== index))}
            aria-label="초대 삭제"
          >
            <Trash2 size={17} />
          </button>
        </div>
      ))}

      <div className="form-actions">
        <button className="primary-button" type="button" disabled={saving} onClick={() => void saveAndContinue()}>
          <Save size={17} aria-hidden="true" />
          저장 후 다음
        </button>
      </div>
    </section>
  );
}
