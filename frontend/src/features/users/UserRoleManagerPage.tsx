import { Save } from "lucide-react";
import { DataTable } from "../../components/tables/DataTable";
import { demoUsers } from "../../services/demoData";
import type { RoleName, User } from "../../services/cmsTypes";

const roles: RoleName[] = ["ADMIN", "EDITOR", "AUTHOR", "VIEWER"];

export function UserRoleManagerPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground dark:text-white">사용자</h1>
        <p className="text-sm text-muted-foreground">사용자 역할을 변경하고 필수 사유를 기록합니다.</p>
      </div>
      <section className="card-box">
        <DataTable<User>
          rows={demoUsers}
          getRowKey={(row) => row.id}
          columns={[
            { key: "name", header: "사용자", render: (row) => <div><p className="font-semibold">{row.displayName}</p><p className="text-xs text-muted-foreground">{row.email}</p></div> },
            { key: "status", header: "상태", render: (row) => row.status },
            {
              key: "role",
              header: "Role",
              render: (row) => (
                <select className="form-control min-w-40" defaultValue={row.roles[0]}>
                  {roles.map((role) => <option key={role}>{role}</option>)}
                </select>
              )
            },
            { key: "reason", header: "사유", render: () => <input className="form-control min-w-64" placeholder="변경 사유" /> },
            { key: "action", header: "", render: () => <button className="button-base h-9 bg-primary px-3 text-white hover:bg-primaryemphasis" type="button"><Save className="h-4 w-4" />저장</button> }
          ]}
        />
      </section>
    </div>
  );
}
