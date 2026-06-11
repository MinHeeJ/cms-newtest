import { Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { createFolder, deleteFolder, fetchAdminFolders, updateFolder } from "../../lib/api/admin";
import { userMessage } from "../../lib/error-messages";
import type { Folder } from "../../types/api";
import { Button } from "../../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";
import { Input } from "../../ui-components/input";
import { ErrorState } from "../../components/common/ErrorState";
import { EmptyState } from "../../components/common/EmptyState";

export function FolderManagePage() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selected, setSelected] = useState<Folder | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setFolders(await fetchAdminFolders());
  }

  useEffect(() => {
    load().catch((err) => setError(userMessage(err)));
  }, []);

  function startEdit(folder: Folder) {
    setSelected(folder);
    setTitle(folder.title);
    setDescription(folder.description ?? "");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const payload = { title, description, active: true, parentId: selected?.parentId ?? null, sortOrder: selected?.sortOrder ?? 0 };
      if (selected) await updateFolder(selected.id, payload);
      else await createFolder(payload);
      setSelected(null);
      setTitle("");
      setDescription("");
      await load();
    } catch (err) {
      setError(userMessage(err));
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader>
          <CardTitle>폴더 목록</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {error ? <ErrorState message={error} /> : null}
          {folders.length === 0 ? <EmptyState message="폴더가 없습니다." /> : null}
          {folders.map((folder) => (
            <button
              key={folder.id}
              className="flex items-center justify-between rounded-md border border-[var(--border)] bg-white p-3 text-left hover:border-[var(--primary)]"
              onClick={() => startEdit(folder)}
            >
              <span className="font-semibold">{folder.title}</span>
              <span className="text-xs text-slate-500">{folder.active ? "활성" : "비활성"}</span>
            </button>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{selected ? "폴더 수정" : "폴더 생성"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3" onSubmit={submit}>
            <Input placeholder="폴더명" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Input placeholder="설명" value={description} onChange={(event) => setDescription(event.target.value)} />
            <Button type="submit">
              {selected ? <Save size={17} /> : <Plus size={17} />} 저장
            </Button>
            {selected ? (
              <Button
                type="button"
                variant="danger"
                onClick={async () => {
                  await deleteFolder(selected.id);
                  setSelected(null);
                  await load();
                }}
              >
                <Trash2 size={17} /> 삭제
              </Button>
            ) : null}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
