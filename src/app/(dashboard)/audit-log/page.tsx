import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAuditEvents } from "@/server/site-creation/site-draft-repository";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const events = await listAuditEvents();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="pt-6 px-3 lg:px-6 pb-4">
        <h1 className="text-xl font-semibold text-stone-900 mb-1">Audit Log</h1>
        <p className="text-sm text-stone-600">Append-only site creation activity.</p>
        <div className="border-b border-stone-200 mt-4" />
      </div>
      <div className="p-6">
        <Card>
          <CardHeader className="border-b border-stone-200">
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Actor</th>
                    <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Draft</th>
                    <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {events.map((event) => (
                    <tr className="transition-colors duration-200 hover:bg-stone-50" key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">{event.event_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{event.actor_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-600">{event.draft_id ?? "system"}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{formatDateTime(event.created_at)}</td>
                    </tr>
                  ))}
                  {events.length === 0 ? (
                    <tr>
                      <td className="px-6 py-8" colSpan={4}>
                        <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center">
                          <h3 className="text-sm font-semibold text-stone-900">No audit events</h3>
                          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                            Create or validate a draft to populate the activity stream.
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
