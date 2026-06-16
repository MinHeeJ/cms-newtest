import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listSiteDrafts } from "@/server/site-creation/site-draft-repository";

export const dynamic = "force-dynamic";

export default async function ValidationReportsPage() {
  const drafts = await listSiteDrafts({ limit: 100 });
  const reports = drafts.flatMap((draft) =>
    draft.latest_validation
      ? [
          {
            draft,
            report: draft.latest_validation
          }
        ]
      : []
  );

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="pt-6 px-3 lg:px-6 pb-4">
        <h1 className="text-xl font-semibold text-stone-900 mb-1">Validation Reports</h1>
        <p className="text-sm text-stone-600">Latest dependency and document-readiness checks by draft.</p>
        <div className="border-b border-stone-200 mt-4" />
      </div>
      <div className="p-6">
        <Card>
          <CardHeader className="border-b border-stone-200">
            <CardTitle>Reports</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Site</th>
                    <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Outcome</th>
                    <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Issues</th>
                    <th className="px-6 py-3 text-right text-xs font-normal text-stone-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {reports.map(({ draft, report }) => (
                    <tr className="transition-colors duration-200 hover:bg-stone-50" key={report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-normal text-stone-900">{draft.site_name}</div>
                        <div className="text-sm text-stone-500">{draft.site_slug}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={report.outcome === "blocked" ? "danger" : report.outcome === "passed" ? "success" : "warning"}>
                          {report.outcome.replaceAll("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{report.issues.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button asChild size="sm" variant="secondary">
                          <Link href={`/site-creation/${draft.id}`}>Open</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {reports.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8" colSpan={4}>
                        <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center">
                          <h3 className="text-sm font-semibold text-stone-900">No validation reports</h3>
                          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                            Validate a generation plan to create the first report.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
