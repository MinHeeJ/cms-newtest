import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import { errorMessage } from '../../services/apiClient';
import { listNotifications, markNotificationRead, NotificationItem } from './notificationApi';

export function NotificationCenter() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const page = await listNotifications(unreadOnly);
      setItems(page.content);
      setMessage('');
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  useEffect(() => {
    load();
  }, [unreadOnly]);

  async function read(notificationId: string) {
    try {
      await markNotificationRead(notificationId);
      await load();
    } catch (error) {
      setMessage(errorMessage(error));
    }
  }

  return (
    <main className="single-panel">
      <div className="section-heading">
        <h1>
          <Bell size={20} /> 알림
        </h1>
        <label className="switch-label">
          <input type="checkbox" checked={unreadOnly} onChange={(event) => setUnreadOnly(event.target.checked)} />
          안 읽은 알림
        </label>
      </div>
      {message && <p className="validation-message">{message}</p>}
      <div className="notification-list">
        {items.length === 0 && <div className="empty-state">표시할 알림이 없습니다.</div>}
        {items.map((item) => (
          <article className={item.readAt ? 'notification-item' : 'notification-item unread'} key={item.id}>
            <div>
              <b className="badge">{item.type}</b>
              <h2>{item.title}</h2>
              <p>{item.message}</p>
              {item.targetType === 'POST' && item.targetId && <Link to={`/posts/${item.targetId}`}>대상 글 보기</Link>}
            </div>
            {!item.readAt && (
              <button className="secondary-button" type="button" onClick={() => read(item.id)}>
                <Check size={16} /> 읽음
              </button>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
