import { Save } from "lucide-react";
import { useEffect, useState } from "react";
import { DataTable } from "../../components/tables/DataTable";
import { LoadingPanel } from "../../components/feedback/UIState";
import { usersApi } from "../../services/usersApi";
import type { RoleName, User } from "../../services/cmsTypes";

const roles: RoleName[] = ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"];

export function UserRoleManagerPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [reasonMap, setReasonMap] = useState<Record<string, string>>({});

  useEffect(() => {
    usersApi.list().then((res) => {
      setUsers(res.items);
      const rm: Record<string, string> = {};
      res.items.forEach((u) => { rm[u.id] = u.roles[0] ?? "VIEWER"; });
      setRoleMap(rm);
    }).finally(() => setLoading(false));
  }, []);

  async function handleSave(userId: string) {
    const role = roleMap[userId];
    const reason = reasonMap[userId];
    if (!role || !reason) return;
    const updated = await usersApi.updateRoles(userId, [role], reason);
    setUsers((u) => u.map((x) => x.id === updated.id ? updated : x));
  }

  if (loading) return <LoadingPanel label="사용자 로딩 중" />;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground dark:text-white">사용자</h1>
        <p className="text-sm text-muted-foreground">사용자 역할을 변경하고 필수 사유를 기록합니다.</p>
      </div>
      <section className="card-box">
        <DataTable<User>
          rows={users}
          getRowKey={(row) => row.id}
          columns={[
            { key: "name", header: "사용자", render: (row) => <div><p className="font-semibold">{row.displayName}</p><p className="text-xs text-muted-foreground">{row.email}</p></div> },
            { key: "status", header: "상태", render: (row) => row.status },
            { key: "role", header: "Role", render: (row) => <select className="form-control min-w-40" value={roleMap[row.id] ?? row.roles[0]} onChange={(e) => setRoleMap((m) => ({ ...m, [row.id]: e.target.value }))}>{roles.map((r) => <option key={r}>{r}</option>)}</select> },
            { key: "reason", header: "사유", render: (row) => <input className="form-control min-w-64" placeholder="변경 사유" value={reasonMap[row.id] ?? ""} onChange={(e) => setReasonMap((m) => ({ ...m, [row.id]: e.target.value }))} /> },
            { key: "action", header: "", render: (row) => <button className="button-base h-9 bg-primary px-3 text-white hover:bg-primaryemphasis" type="button" onClick={() => handleSave(row.id)}><Save className="h-4 w-4" />저장</button> }
          ]}
        />
      </section>
    </div>
  );
}
