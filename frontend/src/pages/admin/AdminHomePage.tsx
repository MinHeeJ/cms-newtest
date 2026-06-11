import { FileText, FolderTree, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";

const cards = [
  { title: "폴더 관리", href: "/admin/folders", icon: FolderTree, text: "계층, 활성 상태, 정렬 순서를 관리합니다." },
  { title: "문서 관리", href: "/admin/articles", icon: FileText, text: "작성, 수정, 발행, 게시중단을 수행합니다." },
  { title: "권한 정책", href: "/portal", icon: ShieldCheck, text: "관리자와 포털 접근 화면을 분리합니다." }
];

export function AdminHomePage() {
  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-black">관리 대시보드</h1>
      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((item) => (
          <DashboardCard key={item.title} item={item} />
        ))}
      </div>
    </div>
  );
}

function DashboardCard({ item }: { item: (typeof cards)[number] }) {
  const Icon = item.icon;
  return (
    <Link to={item.href}>
      <Card className="h-full hover:border-[var(--primary)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon size={20} /> {item.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">{item.text}</CardContent>
      </Card>
    </Link>
  );
}
