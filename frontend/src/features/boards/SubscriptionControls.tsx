import { useState } from 'react';
import { BellPlus, BellOff } from 'lucide-react';
import { errorMessage, getStoredMember } from '../../services/apiClient';
import { subscribeBoard, unsubscribeBoard } from '../posts/postApi';

export function SubscriptionControls({ boardId }: { boardId: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [pending, setPending] = useState(false);
  const member = getStoredMember();

  async function toggle() {
    if (!member) {
      setMessage('로그인 후 구독할 수 있습니다.');
      return;
    }
    setPending(true);
    setMessage('');
    try {
      if (subscribed) {
        await unsubscribeBoard(boardId);
        setSubscribed(false);
      } else {
        await subscribeBoard(boardId);
        setSubscribed(true);
      }
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="subscription-control">
      <button className="secondary-button" type="button" onClick={toggle} disabled={pending}>
        {subscribed ? <BellOff size={16} /> : <BellPlus size={16} />}
        {subscribed ? '구독 중' : '구독'}
      </button>
      {message && <span role="alert">{message}</span>}
    </div>
  );
}
