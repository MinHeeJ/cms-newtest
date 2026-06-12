import { FileText, FolderTree, Gauge, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui-components/card";

const cards = [
  { title: "폴더 관리", value: "계층/정렬/활성", helper: "폴더 트리를 구성하고 공개 상태를 관리합니다.", icon: FolderTree },
  { title: "문서 관리", value: "작성/발행/중단", helper: "마크다운 문서를 작성하고 첨부파일을 연결합니다.", icon: FileText },
  { title: "권한", value: "관리자 전용", helper: "인증된 운영자만 접근 가능한 영역입니다.", icon: ShieldCheck },
  { title: "상태", value: "헬스체크 제공", helper: "서비스 상태와 기본 운영 흐름을 확인합니다.", icon: Gauge }
];

export function AdminHomePage() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">CMS 콘텐츠 운영을 위한 관리자 대시보드입니다.</p>
        </div>
      </div>
      <div className="cms-admin-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card className="gap-4" key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <CardDescription className="mt-1 text-xs">{card.helper}</CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
