import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDomainCatalog } from "@/server/site-creation/domain-catalog";

export default function DomainCatalogPage() {
  const domains = getDomainCatalog();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="pt-6 px-3 lg:px-6 pb-4">
        <h1 className="text-xl font-semibold text-stone-900 mb-1">Domain Catalog</h1>
        <p className="text-sm text-stone-600">Default CMS capability definitions and requires relationships.</p>
        <div className="border-b border-stone-200 mt-4" />
      </div>
      <div className="p-6">
        <Card>
          <CardHeader className="border-b border-stone-200">
            <CardTitle>Definitions</CardTitle>
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
                      <td className="px-6 py-4 min-w-64">
                        <div className="text-sm font-normal text-stone-900">{domain.display_name}</div>
                        <div className="text-sm text-stone-500">{domain.domain_code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant="neutral">{domain.capability}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-stone-600 min-w-64">
                        {domain.requires.length ? domain.requires.join(", ") : "none"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                        {domain.default_generation_order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={domain.selectable ? "success" : "neutral"}>
                          {domain.selectable ? "yes" : "auto"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
