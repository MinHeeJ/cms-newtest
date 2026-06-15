import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ValidationReport } from "@/lib/site-creation/types";
import { formatDateTime } from "@/lib/utils";

function outcomeVariant(outcome: ValidationReport["outcome"]) {
  if (outcome === "passed") return "success";
  if (outcome === "passed_with_warnings") return "warning";
  return "danger";
}

export function ValidationPanel({ report }: { report?: ValidationReport }) {
  if (!report) {
    return (
      <div className="rounded-lg border border-stone-200 bg-white">
        <div className="p-6 border-b border-stone-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg mr-3 bg-stone-100 text-stone-700 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Validation Results</h2>
              <p className="text-sm text-stone-600 mt-1">Run validation before document generation.</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-stone-700 ring-1 ring-stone-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-semibold text-stone-900">No validation report yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
              Validate the plan to reveal blockers, warnings, and suggested dependency fixes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = report.outcome === "blocked" ? AlertTriangle : CheckCircle2;

  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg mr-3 bg-stone-900 text-white flex items-center justify-center">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Validation Results</h2>
              <p className="text-sm text-stone-600 mt-1">Checked {formatDateTime(report.checked_at)}</p>
            </div>
          </div>
          <Badge variant={outcomeVariant(report.outcome)}>{report.outcome.replaceAll("_", " ")}</Badge>
        </div>
      </div>

      {report.issues.length === 0 ? (
        <div className="p-6 text-sm text-stone-600">
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
            No blockers or warnings were found. Document generation can proceed.
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-stone-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Message</th>
                <th className="px-6 py-3 text-left text-xs font-normal text-stone-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-stone-200">
              {report.issues.map((issue) => (
                <tr className="transition-colors duration-200 hover:bg-stone-50" key={issue.id ?? `${issue.code}-${issue.domain_code}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={issue.severity === "blocker" ? "danger" : "warning"}>{issue.severity}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-900">
                    {issue.domain_code ?? "draft"}
                  </td>
                  <td className="px-6 py-4 text-sm text-stone-600 min-w-72">{issue.message}</td>
                  <td className="px-6 py-4 text-sm text-stone-600 min-w-72">{issue.suggested_action ?? "Review draft scope."}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
