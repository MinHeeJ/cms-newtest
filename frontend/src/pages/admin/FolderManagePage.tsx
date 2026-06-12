import { Edit, FolderPlus, Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { LoadingState } from "../../components/common/LoadingState";
import { adminApi, type FolderInput } from "../../lib/api/admin";
import type { Folder } from "../../lib/api/portal";
import { errorMessage } from "../../lib/error-messages";
import { Badge } from "../../ui-components/badge";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui-components/card";
import { Input } from "../../ui-components/input";

export function FolderManagePage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [editing, setEditing] = useState<Folder | null>(null);
  const [form, setForm] = useState<FolderInput>({ title: "", description: "", active: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    return adminApi
      .folders()
      .then((items) => {
        setFolders(items);
        setError(null);
      })
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, []);

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
      void load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove(id: number) {
    try {
      await adminApi.deleteFolder(id);
      void load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">폴더 관리</h1>
        <p className="text-muted-foreground">지식 포털의 폴더 구조와 공개 상태를 관리합니다.</p>
      </div>
      <div className="cms-grid">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderPlus className="size-4" />
              {editing ? "폴더 수정" : "폴더 생성"}
            </CardTitle>
            <CardDescription>폴더명, 설명, 상위 폴더를 입력하세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-3" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="folder-title">폴더명</label>
                <Input id="folder-title" aria-label="폴더명" placeholder="폴더명" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="folder-description">설명</label>
                <Input id="folder-description" aria-label="설명" placeholder="설명" value={form.description ?? ""} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="folder-parent">상위 폴더</label>
                <select id="folder-parent" className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none" value={form.parentId ?? ""} onChange={(event) => setForm({ ...form, parentId: event.target.value ? Number(event.target.value) : null })}>
                  <option value="">루트</option>
                  {folders.filter((folder) => folder.id !== editing?.id).map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.title}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 rounded-md border border-input p-3 text-sm">
                <input checked={form.active ?? true} type="checkbox" onChange={(event) => setForm({ ...form, active: event.target.checked })} />
                활성 상태로 노출
              </label>
              {error ? <ErrorState message={error} /> : null}
              <Button type="submit">
                <Plus className="size-4" />
                저장
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>폴더 목록</CardTitle>
            <CardDescription>현재 등록된 폴더입니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {loading ? <LoadingState /> : null}
              {!loading && !error && folders.length === 0 ? <EmptyState message="등록된 폴더가 없습니다." /> : null}
              {!loading && folders.length > 0 ? (
                <div className="overflow-hidden rounded-md border">
                  <div className="divide-y">
                    {folders.map((folder) => (
                      <div className="flex items-center justify-between gap-2 bg-background p-3 transition-colors hover:bg-muted/50" key={folder.id}>
                        <div className="min-w-0 space-y-1">
                          <div className="truncate font-medium">{folder.title}</div>
                          <div className="flex items-center gap-2">
                            <Badge>{folder.active ? "활성" : "비활성"}</Badge>
                            {folder.description ? <span className="truncate text-xs text-muted-foreground">{folder.description}</span> : null}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button aria-label="수정" size="icon" type="button" variant="ghost" onClick={() => startEdit(folder)}>
                            <Edit className="size-4" />
                          </Button>
                          <Button aria-label="삭제" size="icon" type="button" variant="ghost" onClick={() => void remove(folder.id)}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
