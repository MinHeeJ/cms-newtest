import { Edit, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { adminApi, type FolderInput } from "../../lib/api/admin";
import type { Folder } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
import { Input } from "../../ui-components/input";
import { ErrorState } from "../../components/common/ErrorState";

export function FolderManagePage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [editing, setEditing] = useState<Folder | null>(null);
  const [form, setForm] = useState<FolderInput>({ title: "", description: "", active: true });
  const [error, setError] = useState<string | null>(null);

  const load = () => adminApi.folders().then(setFolders).catch((err) => setError(errorMessage(err)));

  useEffect(load, []);

  function startEdit(folder: Folder) {
    setEditing(folder);
    setForm({
      parentId: folder.parentId,
      title: folder.title,
      description: folder.description,
      active: folder.active,
      sortOrder: folder.sortOrder
    });
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      if (editing) {
        await adminApi.updateFolder(editing.id, form);
      } else {
        await adminApi.createFolder(form);
      }
      setEditing(null);
      setForm({ title: "", description: "", active: true });
      setError(null);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove(id: number) {
    try {
      await adminApi.deleteFolder(id);
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="cms-grid">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "폴더 수정" : "폴더 생성"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={onSubmit}>
            <Input aria-label="폴더명" placeholder="폴더명" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <Input aria-label="설명" placeholder="설명" value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <select className="h-10 rounded-md border border-[var(--border)] px-3" value={form.parentId ?? ""} onChange={(event) => setForm({ ...form, parentId: event.target.value ? Number(event.target.value) : null })}>
              <option value="">루트</option>
              {folders.filter((folder) => folder.id !== editing?.id).map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.title}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input checked={form.active ?? true} type="checkbox" onChange={(event) => setForm({ ...form, active: event.target.checked })} />
              활성
            </label>
            {error ? <ErrorState message={error} /> : null}
            <Button type="submit">
              <Plus size={18} />
              저장
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>폴더 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {folders.map((folder) => (
              <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--border)] p-2" key={folder.id}>
                <div>
                  <div className="font-medium">{folder.title}</div>
                  <div className="text-xs text-[var(--muted)]">{folder.active ? "활성" : "비활성"}</div>
                </div>
                <div className="flex gap-1">
                  <Button aria-label="수정" size="icon" type="button" variant="ghost" onClick={() => startEdit(folder)}>
                    <Edit size={16} />
                  </Button>
                  <Button aria-label="삭제" size="icon" type="button" variant="ghost" onClick={() => void remove(folder.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
