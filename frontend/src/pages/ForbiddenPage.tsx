import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui-components/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui-components/card";

export function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-[min(100%,420px)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert size={20} />
            접근 권한 없음
          </CardTitle>
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
