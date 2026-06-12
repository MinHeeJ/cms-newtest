import { FileText, FolderTree, Gauge, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui-components/card";

const cards = [
  { title: "폴더 관리", value: "계층/정렬/활성", icon: FolderTree },
  { title: "문서 관리", value: "작성/발행/중단", icon: FileText },
  { title: "권한", value: "관리자 전용", icon: ShieldCheck },
  { title: "상태", value: "헬스체크 제공", icon: Gauge }
];

export function AdminHomePage() {
  return (
    <div className="cms-admin-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon size={18} />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
