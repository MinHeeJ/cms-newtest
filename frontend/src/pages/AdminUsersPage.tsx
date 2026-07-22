import { useEffect, useState } from "react";
import { client } from "../api";
import {
  Empty,
  ErrorState,
  LoadingSkeleton,
  PageTitle,
  Toast,
} from "../components/ui";
import type { Role, User } from "../types";

export function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [keyword, setKeyword] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    client
      .users(keyword)
      .then((page) => setUsers(page.items))
      .catch((err: any) =>
        setError(err.message || "사용자 목록을 불러오지 못했습니다."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <>
      <PageTitle
        title="사용자 관리"
        helper="사용자 검색과 역할 변경을 수행합니다."
      />
      <section className="container">
        <div className="mb-[33px] rounded-[11px] bg-[#F9F9F9] p-[19px] lg:p-[33px]">
          <div className="flex flex-col gap-[21px] lg:flex-row">
            <input
              className="input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="email/nickname 검색"
            />
            <button className="btn-primary shrink-0" onClick={load}>
              검색
            </button>
          </div>
        </div>
        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : error ? (
          <ErrorState message={error} retry={load} />
        ) : users.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Nickname</th>
                  <th>Role</th>
                  <th>변경</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.nickname}</td>
                    <td>
                      <span className="badge">{user.role}</span>
                    </td>
                    <td>
                      <select
                        className="input min-w-[140px]"
                        value={user.role}
                        onChange={async (event) => {
                          await client.updateRole(
                            user.id,
                            event.target.value as Role,
                          );
                          setToast("역할이 변경되었습니다");
                          load();
                        }}
                      >
                        <option>USER</option>
                        <option>ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="사용자가 없습니다"
            description="검색 조건에 맞는 사용자가 없습니다."
          />
        )}
      </section>
      <Toast msg={toast} />
    </>
  );
}
