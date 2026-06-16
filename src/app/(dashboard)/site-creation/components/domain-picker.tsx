"use client";

import { Check, GitBranch, Layers3, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { DomainCapability, DomainDefinition } from "@/lib/site-creation/types";
import { cn } from "@/lib/utils";

const capabilities: DomainCapability[] = ["Core", "Content", "Experience", "Governance", "Insights"];

export function DomainPicker({
  domains,
  selected,
  onToggle
}: {
  domains: DomainDefinition[];
  selected: string[];
  onToggle: (domainCode: string) => void;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg mr-3 bg-blue-100 text-blue-600 flex items-center justify-center">
            <GitBranch className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">CMS Domains</h2>
            <p className="text-sm text-stone-600 mt-1">Selected domains are expanded with required dependencies.</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {domains.length === 0 ? (
          <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-stone-700 ring-1 ring-stone-200">
              <Layers3 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">No domains available</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
              Domain options did not return any selectable catalog entries. Check the catalog before creating a draft.
            </p>
          </div>
        ) : null}

        {selected.length === 0 && domains.length > 0 ? (
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            Select at least one selectable CMS domain to continue.
          </div>
        ) : null}

        {capabilities.map((capability) => {
          const capabilityDomains = domains.filter((domain) => domain.capability === capability);
          if (capabilityDomains.length === 0) {
            return null;
          }

          return (
            <section key={capability}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-normal text-stone-900">{capability}</h3>
                <Badge variant="neutral">{capabilityDomains.length} options</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {capabilityDomains.map((domain) => {
                  const checked = selected.includes(domain.domain_code);
                  const disabled = !domain.selectable;

                  return (
                    <label
                      className={cn(
                        "border rounded-lg p-4 transition-colors duration-200",
                        checked ? "border-stone-900 bg-stone-50" : "border-stone-200 bg-white hover:bg-stone-50",
                        disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
                      )}
                      key={domain.domain_code}
                    >
                      <div className="flex items-start">
                        <input
                          checked={checked}
                          className="sr-only"
                          disabled={disabled}
                          onChange={() => onToggle(domain.domain_code)}
                          type="checkbox"
                        />
                        <span
                          className={cn(
                            "mt-0.5 mr-3 h-5 w-5 rounded-md border flex items-center justify-center shrink-0",
                            checked
                              ? "bg-stone-900 border-stone-900 text-white"
                              : "bg-white border-stone-300 text-transparent"
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-normal text-stone-900 truncate">{domain.display_name}</span>
                            {disabled ? <Badge variant="neutral">auto</Badge> : null}
                          </span>
                          <span className="block text-xs text-stone-500 mt-1 leading-relaxed">
                            {domain.description}
                          </span>
                          {domain.requires.length > 0 ? (
                            <span className="flex flex-wrap gap-2 mt-3">
                              {domain.requires.map((required) => (
                                <Badge key={required} variant="info">
                                  <Plus className="mr-1 h-3 w-3" />
                                  {required}
                                </Badge>
                              ))}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
