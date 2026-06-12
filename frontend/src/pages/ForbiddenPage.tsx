import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui-components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui-components/card";

export function ForbiddenPage() {
  return (
    <main className="grid h-svh place-items-center p-4">
      <Card className="w-[min(100%,420px)] text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldAlert className="size-6" />
          </div>
          <CardTitle className="text-lg">접근 권한 없음</CardTitle>
          <CardDescription>이 페이지를 열람할 수 있는 권한이 없습니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link to="/portal">포털로 이동</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
