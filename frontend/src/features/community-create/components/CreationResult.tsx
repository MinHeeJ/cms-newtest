import { AlertTriangle, CheckCircle2, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SubmitCommunityCreationResponse } from '../api/communityCreationClient';

export function CreationResult({ result }: { result: SubmitCommunityCreationResponse }) {
  if (result.result === 'LAUNCHED') {
    return (
      <div className="result-panel success">
        <CheckCircle2 size={30} aria-hidden="true" />
        <div>
          <h2>커뮤니티가 개설되었습니다.</h2>
          <p>생성자가 커뮤니티장으로 지정되었고 공개 화면에 노출될 수 있습니다.</p>
          {result.communityId ? <Link to={`/communities/${result.communityId}`}>커뮤니티 정보 확인</Link> : null}
        </div>
      </div>
    );
  }

  if (result.result === 'PENDING_REVIEW') {
    return (
      <div className="result-panel pending">
        <Clock3 size={30} aria-hidden="true" />
        <div>
          <h2>운영자 검수 대기 중입니다.</h2>
          <p>승인 전에는 디렉터리와 검색에 노출되지 않습니다.</p>
          <Link to="/operator/community-reviews">운영자 검수 화면 열기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="result-panel danger">
      <AlertTriangle size={30} aria-hidden="true" />
      <div>
        <h2>제출 전 수정이 필요합니다.</h2>
        <p>표시된 항목을 수정한 뒤 다시 제출해 주세요.</p>
      </div>
    </div>
  );
}
