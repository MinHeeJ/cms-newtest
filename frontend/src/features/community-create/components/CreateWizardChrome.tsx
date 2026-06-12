import { CheckCircle2, ChevronRight, CloudOff, Loader2, WifiOff } from 'lucide-react';
import { WizardStep } from '../state/useCommunityCreateWizard';

interface CreateWizardStepperProps {
  steps: Array<{ id: WizardStep; label: string }>;
  activeStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
}

export function CreateWizardStepper({ steps, activeStep, onStepChange }: CreateWizardStepperProps) {
  const activeIndex = steps.findIndex((step) => step.id === activeStep);

  return (
    <ol className="stepper" aria-label="개설 단계">
      {steps.map((step, index) => (
        <li key={step.id}>
          <button
            type="button"
            className={activeStep === step.id ? 'active' : index < activeIndex ? 'complete' : ''}
            onClick={() => onStepChange(step.id)}
            aria-current={activeStep === step.id ? 'step' : undefined}
            aria-label={`${index + 1}단계 ${step.label}${index < activeIndex ? ', 완료' : activeStep === step.id ? ', 현재 단계' : ''}`}
          >
            <span>{index < activeIndex ? <CheckCircle2 size={13} aria-hidden="true" /> : index + 1}</span>
            {step.label}
          </button>
          {index < steps.length - 1 ? <ChevronRight size={15} aria-hidden="true" className="text-muted-foreground" /> : null}
        </li>
      ))}
    </ol>
  );
}

interface DraftStatusIndicatorProps {
  saving: boolean;
  hasError: boolean;
  updatedAt?: string;
}

export function DraftStatusIndicator({ saving, hasError, updatedAt }: DraftStatusIndicatorProps) {
  const offline = typeof navigator !== 'undefined' && navigator.onLine === false;

  if (offline) {
    return (
      <span className="draft-status offline" role="status">
        <WifiOff size={15} aria-hidden="true" /> 오프라인 · 연결 후 다시 저장됩니다
      </span>
    );
  }

  if (saving) {
    return (
      <span className="draft-status saving" role="status">
        <Loader2 size={15} className="spin" aria-hidden="true" /> 저장 중
      </span>
    );
  }

  if (hasError) {
    return (
      <span className="draft-status failed" role="status">
        <CloudOff size={15} aria-hidden="true" /> 저장 실패 · 입력 내용을 유지했습니다
      </span>
    );
  }

  return (
    <span className="draft-status" role="status">
      <CheckCircle2 size={15} aria-hidden="true" /> 마지막 저장 {updatedAt ? new Date(updatedAt).toLocaleString('ko-KR') : '대기 중'}
    </span>
  );
}
