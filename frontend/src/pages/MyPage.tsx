import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Field, PageTitle, Toast } from "../components/ui";
import { client } from "../api";

export function MyPage() {
  const { user, refresh } = useAuth();
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => setNickname(user?.nickname || ""), [user]);

  return (
    <>
      <PageTitle title="내 정보" />
      <section className="mx-auto max-w-[480px] px-[27px] py-10 lg:py-[100px]">
        <div className="base-card">
          <Field
            label="Email"
            value={user?.email || ""}
            onChange={() => undefined}
            readOnly
          />
          <Field
            label="Nickname"
            required
            value={nickname}
            onChange={setNickname}
          />
          <button
            className="btn-primary w-full"
            disabled={!nickname || saving}
            onClick={async () => {
              setSaving(true);
              await client.updateMe(nickname);
              await refresh();
              setSaving(false);
              setToast("내 정보가 저장되었습니다");
            }}
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </section>
      <Toast msg={toast} />
    </>
  );
}
