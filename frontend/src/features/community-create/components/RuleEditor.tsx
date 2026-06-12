import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { RuleInput, RuleResponse } from '../api/communityCreationClient';

interface RuleEditorProps {
  rules: RuleResponse[];
  saving: boolean;
  onSave: (rules: RuleInput[]) => Promise<void>;
  onNext: () => void;
}

export function RuleEditor({ rules, saving, onSave, onNext }: RuleEditorProps) {
  const [draftRules, setDraftRules] = useState<RuleInput[]>(
    rules.length
      ? rules
      : [
          {
            title: '서로 존중하기',
            body: '비방, 혐오 표현, 개인정보 노출을 금지합니다.',
            required: true,
            displayOrder: 1
          }
        ]
  );

  function updateRule(index: number, patch: Partial<RuleInput>) {
    setDraftRules((current) => current.map((rule, ruleIndex) => (ruleIndex === index ? { ...rule, ...patch } : rule)));
  }

  async function saveAndContinue() {
    await onSave(draftRules.map((rule, index) => ({ ...rule, displayOrder: index + 1 })));
    onNext();
  }

  return (
    <section className="editor-stack">
      <div className="toolbar-row">
        <strong>참여 규칙</strong>
        <button
          className="icon-text-button"
          type="button"
          onClick={() => setDraftRules([...draftRules, { title: '', body: '', required: true, displayOrder: draftRules.length + 1 }])}
        >
          <Plus size={16} aria-hidden="true" />
          추가
        </button>
      </div>

      {draftRules.map((rule, index) => (
        <div className="rule-row" key={`${rule.title}-${index}`}>
          <div className="rule-fields">
            <input value={rule.title} onChange={(event) => updateRule(index, { title: event.target.value })} placeholder="규칙 제목" />
            <textarea value={rule.body} onChange={(event) => updateRule(index, { body: event.target.value })} placeholder="규칙 내용" />
            <label className="inline-check">
              <input
                type="checkbox"
                checked={rule.required ?? true}
                onChange={(event) => updateRule(index, { required: event.target.checked })}
              />
              필수 규칙
            </label>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={() => setDraftRules(draftRules.filter((_, itemIndex) => itemIndex !== index))}
            aria-label="규칙 삭제"
            disabled={draftRules.length === 1}
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
