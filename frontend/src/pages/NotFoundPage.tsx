import { Link } from "react-router-dom";
import { Button } from "../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui-components/card";

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-[min(100%,420px)]">
        <CardHeader>
          <CardTitle>페이지를 찾을 수 없습니다</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild variant="secondary">
            <Link to="/portal">포털로 이동</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
