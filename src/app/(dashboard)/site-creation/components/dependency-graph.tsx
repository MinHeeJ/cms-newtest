import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DomainDefinition, GenerationStage } from "@/lib/site-creation/types";

export function DependencyGraph({
  stages,
  domains
}: {
  stages: GenerationStage[];
  domains: DomainDefinition[];
}) {
  const catalog = new Map(domains.map((domain) => [domain.domain_code, domain]));

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg mr-3 bg-blue-100 text-blue-600 flex items-center justify-center">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Dependency Graph</h2>
            <p className="text-sm text-stone-600 mt-1">Requires relationships are grouped by generation stage.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {stages.map((stage) => (
          <div className="flex flex-col md:flex-row md:items-start gap-3" key={stage.stage_number}>
            <Badge variant="neutral">Stage {stage.stage_number}</Badge>
            <div className="flex-1 flex flex-wrap gap-3">
              {stage.domain_codes.map((domainCode) => {
                const definition = catalog.get(domainCode);
                return (
                  <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 min-w-0" key={domainCode}>
                    <div className="text-sm font-normal text-stone-900 break-words">{domainCode}</div>
                    <div className="text-xs text-stone-500 mt-1">
                      requires: {definition?.requires.length ? definition.requires.join(", ") : "none"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
