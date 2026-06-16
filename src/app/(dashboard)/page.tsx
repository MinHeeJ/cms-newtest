import Link from "next/link";
import { AlertTriangle, CheckCircle2, FileCheck2, FilePlus2, Layers3, ShieldCheck, Sigma } from "lucide-react";
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
      <section
        aria-labelledby="dashboard-hero-title"
        className="relative mb-8 overflow-hidden rounded-lg bg-black px-6 py-8 text-white shadow-sm lg:px-8 lg:py-10"
        data-testid="dashboard-hero"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[url('/cms-dashboard-hero.png')] bg-cover bg-center opacity-80"
          data-testid="dashboard-hero-background"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.94)_34%,rgba(0,0,0,0.38)_100%)]"
        />
        <div className="relative z-10 flex max-w-2xl flex-col items-start">
          <div className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100">
            <ShieldCheck className="mr-2 h-3.5 w-3.5 text-emerald-300" />
            CMS service operations
          </div>
          <h1 id="dashboard-hero-title" className="text-2xl font-semibold tracking-normal text-white lg:text-3xl">
            Dashboard
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-stone-200 lg:text-base">
            Plan CMS site drafts, resolve domain dependencies, validate handoff readiness, and generate spec,
            plan, and task bundles from one governed workspace.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button
              asChild
              className="border-white bg-white bg-none text-stone-950 hover:border-stone-100 hover:bg-stone-100 hover:text-stone-950 hover:opacity-100"
            >
              <Link href="/site-creation">
                <FilePlus2 className="mr-2 h-4 w-4" />
                Create CMS Site
              </Link>
            </Button>
            <Button
              asChild
              className="border-white/25 bg-white/5 text-stone-100 hover:border-white/50 hover:bg-white/10 hover:text-white hover:opacity-100"
              variant="secondary"
            >
              <Link href="/drafts">
                <Layers3 className="mr-2 h-4 w-4" />
                View Drafts
              </Link>
            </Button>
          </div>
        </div>
      </section>

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
