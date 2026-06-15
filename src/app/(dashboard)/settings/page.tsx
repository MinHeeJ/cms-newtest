import Link from "next/link";
import { ClipboardList, GitBranch, History, Settings, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDomainCatalog } from "@/server/site-creation/domain-catalog";

export default function SettingsPage() {
  const domains = getDomainCatalog();
  const stages = Array.from(new Set(domains.map((domain) => domain.default_generation_order))).sort((a, b) => a - b);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="pt-6 px-3 lg:px-6 pb-4">
        <h1 className="text-xl font-semibold text-stone-900 mb-1">Settings</h1>
        <p className="text-sm text-stone-600">CMS domain defaults and generation controls for administrators.</p>
        <div className="border-b border-stone-200 mt-4" />
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-stone-200">
            <CardHeader className="border-b border-stone-200">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg mr-3 bg-stone-900 text-white flex items-center justify-center">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-stone-900">Domain definitions</CardTitle>
                  <p className="text-sm text-stone-600 mt-1">Catalog entries used by create, validation, and document generation.</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-stone-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Domain</th>
                      <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Capability</th>
                      <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Requires</th>
                      <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Selectable</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-stone-200">
                    {domains.map((domain) => (
                      <tr className="transition-colors duration-200 hover:bg-stone-50" key={domain.domain_code}>
                        <td className="px-6 py-4 min-w-72">
                          <div className="text-sm font-normal text-stone-900">{domain.display_name}</div>
                          <div className="text-sm text-stone-500 break-all">{domain.domain_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="neutral">{domain.capability}</Badge>
                        </td>
                        <td className="px-6 py-4 min-w-72">
                          <div className="flex flex-wrap gap-2">
                            {domain.requires.length ? (
                              domain.requires.map((required) => (
                                <Badge key={required} variant="info">
                                  {required}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="neutral">none</Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                          Stage {domain.default_generation_order}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={domain.selectable ? "success" : "neutral"}>{domain.selectable ? "yes" : "auto"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border-stone-200">
              <CardHeader className="border-b border-stone-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg mr-3 bg-blue-100 text-blue-600 flex items-center justify-center">
                    <GitBranch className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-stone-900">Requires editor</CardTitle>
                    <p className="text-sm text-stone-600 mt-1">Read-only dependency map for this build.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                {domains.map((domain) => (
                  <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3" key={domain.domain_code}>
                    <div className="text-sm font-normal text-stone-900 break-all">{domain.domain_code}</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {domain.requires.length ? (
                        domain.requires.map((required) => (
                          <Badge key={required} variant="info">
                            {required}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="neutral">requires none</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-stone-200">
              <CardHeader className="border-b border-stone-200">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-lg mr-3 bg-green-100 text-green-600 flex items-center justify-center">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-stone-900">Generation order</CardTitle>
                    <p className="text-sm text-stone-600 mt-1">Default stage grouping.</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {stages.map((stage) => (
                  <div key={stage}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-normal text-stone-900">Stage {stage}</span>
                      <Badge variant="neutral">{domains.filter((domain) => domain.default_generation_order === stage).length} domains</Badge>
                    </div>
                    <div className="space-y-2">
                      {domains
                        .filter((domain) => domain.default_generation_order === stage)
                        .map((domain) => (
                          <div className="rounded-lg border border-stone-200 px-3 py-2 text-sm text-stone-700 break-all" key={domain.domain_code}>
                            {domain.domain_code}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="border-stone-200">
          <CardHeader className="border-b border-stone-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-lg mr-3 bg-stone-900 text-white flex items-center justify-center">
                  <Settings className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-stone-900">Policy and audit access</CardTitle>
                  <p className="text-sm text-stone-600 mt-1">Authorization policy plus quick access to append-only activity.</p>
                </div>
              </div>
              <Button asChild size="sm" variant="secondary">
                <Link href="/audit-log">
                  <History className="mr-2 h-4 w-4" />
                  Open Audit Log
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="text-xs font-normal text-stone-500 uppercase tracking-wider">Authorization</div>
              <p className="mt-2 text-sm text-stone-700 leading-relaxed">
                Set SITE_CREATION_REQUIRE_AUTH=true to require x-operator-role: admin at runtime.
              </p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="text-xs font-normal text-stone-500 uppercase tracking-wider">Catalog size</div>
              <p className="mt-2 text-2xl font-bold text-stone-900">{domains.length}</p>
            </div>
            <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="text-xs font-normal text-stone-500 uppercase tracking-wider">Stages</div>
              <p className="mt-2 text-2xl font-bold text-stone-900">{stages.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
