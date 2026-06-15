import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileCheck2, FilePlus2, Layers3, Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RecentDraftsTable } from "@/components/dashboard/recent-drafts-table";
import { StatusCard } from "@/components/dashboard/status-card";
import { getDashboardSummary } from "@/server/site-creation/dashboard-summary";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();

  return (
    <div className="h-full overflow-y-auto p-6 custom-scrollbar">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-semibold text-stone-900 mb-1">Dashboard</h1>
          <p className="text-sm text-stone-600">
            Monitor CMS site drafts, validation outcomes, and generated document bundles.
          </p>
        </div>
        <Button asChild>
          <Link href="/site-creation">
            <FilePlus2 className="mr-2 h-4 w-4" />
            Create CMS Site
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatusCard
          description="All active draft workspaces"
          icon={Layers3}
          title="Total Drafts"
          value={summary.total_drafts}
        />
        <StatusCard
          description="Bundles completed for review"
          icon={FileCheck2}
          title="Generated"
          tone="success"
          value={summary.generated_drafts}
        />
        <StatusCard
          description="Drafts with blocking issues"
          icon={AlertTriangle}
          title="Blocked"
          tone={summary.blocked_drafts > 0 ? "danger" : "neutral"}
          value={summary.blocked_drafts}
        />
        <StatusCard
          description="Average effective domains"
          icon={Sigma}
          title="Avg Domains"
          tone="warning"
          value={summary.average_domains_per_draft}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <Card className="border-gray-200">
          <CardHeader className="border-b border-gray-200 flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">Recent Drafts</CardTitle>
              <div className="text-sm text-gray-500 flex items-center mt-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2" />
                Sorted by latest update
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <RecentDraftsTable drafts={summary.recent_drafts} />
          </CardContent>
        </Card>

        <Card className="border-stone-200">
          <CardHeader className="border-b border-stone-200">
            <CardTitle className="text-lg font-semibold text-stone-900">Blockers</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {summary.blockers.length === 0 ? (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800 flex items-start">
                <CheckCircle2 className="mr-2 mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p className="font-normal text-green-900">No active blockers</p>
                  <p className="mt-1 text-green-800/80">Recent drafts are clear of blocking validation issues.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {summary.blockers.slice(0, 5).map((blocker) => (
                  <div className="flex items-start" key={`${blocker.draft_id}-${blocker.issue.id}`}>
                    <div className="flex-shrink-0 mr-3 text-red-500">
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-normal text-stone-900 truncate">{blocker.site_name}</p>
                        <Badge variant="danger">blocker</Badge>
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">{blocker.issue.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
