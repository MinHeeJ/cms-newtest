import { AccessStep } from '../components/AccessStep';
import { BoardListEditor } from '../components/BoardListEditor';
import { CreationResult } from '../components/CreationResult';
import { CreationSummaryPanel } from '../components/CreationSummaryPanel';
import { CreateWizardStepper, DraftStatusIndicator } from '../components/CreateWizardChrome';
import { ErrorState, LoadingState } from '../components/CreateWizardStates';
import { IdentityStep } from '../components/IdentityStep';
import { ImageUploader } from '../components/ImageUploader';
import { ModeratorInviteInput } from '../components/ModeratorInviteInput';
import { RuleEditor } from '../components/RuleEditor';
import { useCommunityCreateWizard, wizardSteps, WizardStep } from '../state/useCommunityCreateWizard';

export function CommunityCreatePage() {
  const wizard = useCommunityCreateWizard();

  if (wizard.loading) {
    return <LoadingState />;
  }

  if (!wizard.request) {
    return wizard.error ? <ErrorState error={wizard.error} onRetry={() => window.location.reload()} /> : null;
  }

  const request = wizard.request;
  const activeIndex = wizardSteps.findIndex((step) => step.id === wizard.activeStep);
  const goNext = () => wizard.setActiveStep(wizardSteps[Math.min(activeIndex + 1, wizardSteps.length - 1)].id);
  const category = request.categoryId ? wizard.categoryMap.get(request.categoryId) : undefined;

  return (
    <div className="page-grid">
      <section className="workspace">
        <div className="page-title-row">
          <div>
            <span className="section-kicker">Member wizard</span>
            <h1>커뮤니티 신규 개설</h1>
            <p>기본 정보부터 운영 초기 설정까지 저장한 뒤 공개 또는 운영자 검수로 제출합니다.</p>
          </div>
          <div className="grid gap-2 justify-items-end">
            <span className={`status-badge status-${request.status.toLowerCase()}`}>{request.status}</span>
            <DraftStatusIndicator saving={wizard.saving} hasError={Boolean(wizard.error)} updatedAt={request.updatedAt} />
          </div>
        </div>

        <CreateWizardStepper steps={wizardSteps} activeStep={wizard.activeStep} onStepChange={wizard.setActiveStep} />

        {wizard.error ? <ErrorState error={wizard.error} /> : null}

        <div className="wizard-surface">
          {renderStep(wizard.activeStep, {
            request,
            wizard,
            goNext
          })}
        </div>

        {wizard.submitResult ? <CreationResult result={wizard.submitResult} /> : null}
      </section>

      <aside className="preview-panel" aria-label="커뮤니티 미리보기">
        <div className="preview-hero" aria-hidden="true"><div /></div>
        <span className="status-badge">LIVE PREVIEW</span>
        <h2>{request.displayName || '새 커뮤니티'}</h2>
        <p className="preview-slug">/c/{request.slug || 'community-address'}</p>
        <p>{request.description || '커뮤니티 소개가 여기에 표시됩니다.'}</p>
        <dl>
          <div>
            <dt>카테고리</dt>
            <dd>{category?.name ?? '미선택'}</dd>
          </div>
          <div>
            <dt>공개 범위</dt>
            <dd>{request.visibility ?? 'PUBLIC'}</dd>
          </div>
          <div>
            <dt>게시판</dt>
            <dd>{request.boards.map((board) => board.name).join(', ') || '없음'}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}

function renderStep(
  step: WizardStep,
  context: {
    request: NonNullable<ReturnType<typeof useCommunityCreateWizard>['request']>;
    wizard: ReturnType<typeof useCommunityCreateWizard>;
    goNext: () => void;
  }
) {
  const { request, wizard, goNext } = context;

  switch (step) {
    case 'identity':
      return (
        <IdentityStep
          request={request}
          categories={wizard.categories}
          slugCheckResult={wizard.slugCheckResult}
          saving={wizard.saving}
          onCheckSlug={wizard.runSlugCheck}
          onSave={wizard.saveIdentity}
          onNext={goNext}
        />
      );
    case 'access':
      return <AccessStep request={request} saving={wizard.saving} onSave={wizard.saveAccess} onNext={goNext} />;
    case 'boards':
      return <BoardListEditor boards={request.boards} saving={wizard.saving} onSave={wizard.saveBoards} onNext={goNext} />;
    case 'rules':
      return <RuleEditor rules={request.rules} saving={wizard.saving} onSave={wizard.saveRules} onNext={goNext} />;
    case 'image':
      return <ImageUploader request={request} saving={wizard.saving} onUpload={wizard.uploadImage} onNext={goNext} />;
    case 'moderators':
      return (
        <ModeratorInviteInput
          invitations={request.moderatorInvitations}
          saving={wizard.saving}
          onSave={wizard.saveInvitations}
          onNext={goNext}
        />
      );
    case 'summary':
      return (
        <CreationSummaryPanel
          request={request}
          category={request.categoryId ? wizard.categoryMap.get(request.categoryId) : undefined}
          saving={wizard.saving}
          onSubmit={wizard.submit}
        />
      );
    default:
      return null;
  }
}
