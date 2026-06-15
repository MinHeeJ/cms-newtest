import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentDraftsTable } from "@/components/dashboard/recent-drafts-table";
import { toSummary } from "@/server/site-creation/dashboard-summary";
import { listSiteDrafts } from "@/server/site-creation/site-draft-repository";

export const dynamic = "force-dynamic";

export default async function DraftsPage() {
  const drafts = await listSiteDrafts({ limit: 100 });

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="pt-6 px-3 lg:px-6 pb-4">
        <h1 className="text-xl font-semibold text-stone-900 mb-1">Drafts</h1>
        <p className="text-sm text-stone-600">Browse CMS site creation drafts and resume review work.</p>
        <div className="border-b border-stone-200 mt-4" />
      </div>
      <div className="p-6">
        <Card>
          <CardHeader className="border-b border-stone-200">
            <CardTitle>Recent Drafts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <RecentDraftsTable drafts={drafts.map(toSummary)} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
