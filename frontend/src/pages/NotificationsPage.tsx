import { useEffect, useState } from "react";
import { client } from "../api";
import {
  Empty,
  ErrorState,
  LoadingSkeleton,
  PageTitle,
  Toast,
} from "../components/ui";
import type { NotificationItem } from "../types";

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    client
      .notifications()
      .then((page) => setItems(page.items))
      .catch((err: any) =>
        setError(err.message || "알림을 불러오지 못했습니다."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <>
      <PageTitle title="알림 목록" helper="읽지 않은 댓글 알림을 확인합니다." />
      <section className="container">
        <div className="mb-[33px] flex items-center justify-between rounded-[11px] bg-[#F9F9F9] p-[19px]">
          <p className="font-semibold text-[#666666]">
            총 {items.length}개의 알림
          </p>
          <button
            className="btn-primary"
            disabled={!items.length}
            onClick={async () => {
              await client.readAllNotifications();
              setToast("전체 읽음 처리되었습니다");
              load();
            }}
          >
            전체 읽음
          </button>
        </div>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : error ? (
          <ErrorState message={error} retry={load} />
        ) : items.length ? (
          items.map((item) => (
            <div className="base-card mb-[21px]" key={item.id}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className="badge w-fit">{item.type}</span>
                <span className="text-sm text-[#AAAAAA]">
                  {item.created_at?.slice(0, 10)}
                </span>
              </div>
              <p className="mt-3 text-[#666666]">{item.message}</p>
              <button
                className="btn-secondary-sm mt-3"
                onClick={async () => {
                  await client.readNotification(item.id);
                  setToast("읽음 처리되었습니다");
                  load();
                }}
              >
                읽음
              </button>
            </div>
          ))
        ) : (
          <Empty
            title="새 알림이 없습니다"
            description="새 댓글 알림이 도착하면 이곳에 표시됩니다."
          />
        )}
      </section>
      <Toast msg={toast} />
    </>
  );
}
