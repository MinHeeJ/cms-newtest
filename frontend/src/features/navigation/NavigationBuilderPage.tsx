import { GripVertical, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { LoadingPanel } from "../../components/feedback/UIState";
import { navigationApi } from "../../services/navigationApi";
import type { NavigationMenu, NavigationItem } from "../../services/cmsTypes";

export function NavigationBuilderPage() {
  const [menus, setMenus] = useState<NavigationMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigationApi.list().then(setMenus).finally(() => setLoading(false));
  }, []);

  const menu = menus[0];

  async function handleSave() {
    if (!menu) return;
    setSaving(true);
    try {
      const updated = await navigationApi.update(menu.id, { key: menu.key, label: menu.label, isActive: menu.isActive, items: menu.items });
      setMenus((m) => m.map((x) => x.id === updated.id ? updated : x));
    } finally { setSaving(false); }
  }

  if (loading) return <LoadingPanel label="내비게이션 로딩 중" />;
  if (!menu) return <p className="text-sm text-muted-foreground">메뉴가 없습니다.</p>;

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-12 lg:col-span-8">
        <div className="card-box">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="card-title">내비게이션 구성</h1>
              <p className="text-sm text-muted-foreground">공개 메뉴 항목과 표시 순서를 관리합니다.</p>
            </div>
            <button className="button-base bg-primary text-white hover:bg-primaryemphasis" type="button" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4" aria-hidden="true" />{saving ? "저장 중..." : "저장"}
            </button>
          </div>
          <div className="space-y-3">
            {menu.items.map((item) => (
              <div key={item.id} className="grid grid-cols-1 gap-3 rounded-md border border-ld p-4 dark:border-[#333f55] md:grid-cols-[auto_minmax(0,1fr)_180px_auto] md:items-center">
                <GripVertical className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                <input className="form-control" defaultValue={item.label} aria-label="메뉴 라벨" />
                <select className="form-control" defaultValue={item.targetType}>
                  <option>CONTENT</option><option>CATEGORY</option><option>URL</option>
                </select>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input type="checkbox" defaultChecked={item.isVisible} />공개
                </label>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="col-span-12 lg:col-span-4">
        <div className="card-box">
          <h2 className="card-title">미리보기</h2>
          <nav className="mt-6 rounded-md bg-lightsecondary p-4">
            {menu.items.filter((i) => i.isVisible).map((item) => (
              <a key={item.id} className="block rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-white hover:text-primary dark:text-white" href={item.url ?? "#"}>{item.label}</a>
            ))}
          </nav>
        </div>
      </section>
    </div>
  );
}
