import { SearchX } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui-components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui-components/card";

export function NotFoundPage() {
  return (
    <main className="grid h-svh place-items-center p-4">
      <Card className="w-[min(100%,420px)] text-center">
        <CardHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchX className="size-6" />
          </div>
          <CardTitle className="text-lg">페이지를 찾을 수 없습니다</CardTitle>
          <CardDescription>요청한 페이지가 없거나 이동되었습니다.</CardDescription>
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
