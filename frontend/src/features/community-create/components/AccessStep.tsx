import { FormEvent, useState } from 'react';
import { CommunityCreationRequest, JoinPolicy, Visibility } from '../api/communityCreationClient';
import { AccessValues } from '../state/useCommunityCreateWizard';

interface AccessStepProps {
  request: CommunityCreationRequest;
  saving: boolean;
  onSave: (values: AccessValues) => Promise<void>;
  onNext: () => void;
}

export function AccessStep({ request, saving, onSave, onNext }: AccessStepProps) {
  const [values, setValues] = useState<AccessValues>({
    visibility: request.visibility ?? 'PUBLIC',
    joinPolicy: request.joinPolicy ?? 'OPEN'
  });

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    await onSave(values);
    onNext();
  }

  return (
    <form className="wizard-form" onSubmit={handleSubmit}>
      <div>
        <span className="section-kicker">Access</span>
        <h2>처음 누가 볼 수 있고, 어떻게 들어오는지 정합니다</h2>
        <p className="text-sm leading-6 text-muted-foreground">공개 범위와 가입 방식은 제출 전 요약에서 다시 확인할 수 있습니다.</p>
      </div>

      <VisibilitySegmentedControl value={values.visibility} onChange={(visibility) => setValues({ ...values, visibility })} />
      <JoinPolicySelector value={values.joinPolicy} onChange={(joinPolicy) => setValues({ ...values, joinPolicy })} />

      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={saving}>
          저장 후 다음
        </button>
      </div>
    </form>
  );
}

function VisibilitySegmentedControl({ value, onChange }: { value: Visibility; onChange: (value: Visibility) => void }) {
  const options: Array<{ value: Visibility; label: string; description: string }> = [
    { value: 'PUBLIC', label: '공개', description: '검색과 디렉터리에 노출' },
    { value: 'PRIVATE', label: '비공개', description: '링크가 있어도 멤버만 접근' },
    { value: 'INVITE_ONLY', label: '초대 전용', description: '초대받은 사용자만 접근' }
  ];

  return (
    <fieldset>
      <legend>공개 범위</legend>
      <div className="segmented-control">
        {options.map((option) => (
          <button key={option.value} type="button" className={value === option.value ? 'selected' : ''} onClick={() => onChange(option.value)}>
            <span className="grid text-left">
              <strong>{option.label}</strong>
              <small className="font-normal text-muted-foreground">{option.description}</small>
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function JoinPolicySelector({ value, onChange }: { value: JoinPolicy; onChange: (value: JoinPolicy) => void }) {
  return (
    <fieldset>
      <legend>가입 방식</legend>
      <select value={value} onChange={(event) => onChange(event.target.value as JoinPolicy)}>
        <option value="OPEN">바로 가입</option>
        <option value="APPROVAL_REQUIRED">승인 후 가입</option>
        <option value="INVITE_ONLY">초대만 허용</option>
      </select>
      <span className="field-hint">초대 전용 공개 범위에서는 가입 방식도 초대 중심으로 운영하는 것을 권장합니다.</span>
    </fieldset>
  );
}
