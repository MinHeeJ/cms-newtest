"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck2,
  FilePlus2,
  GitCommitHorizontal,
  Loader2,
  Play,
  ShieldCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  CmsSiteDraft,
  DomainDefinition,
  GenerationJob,
  ValidationReport
} from "@/lib/site-creation/types";
import { DependencyGraph } from "./dependency-graph";
import { DocumentBundleCard } from "./document-bundle-card";
import { GenerationProgressPanel } from "./generation-progress-panel";
import { ValidationPanel } from "./validation-panel";

export function DraftReviewClient({
  initialDraft,
  domains
}: {
  initialDraft: CmsSiteDraft;
  domains: DomainDefinition[];
}) {
  const [draft, setDraft] = useState(initialDraft);
  const [validation, setValidation] = useState<ValidationReport | undefined>(initialDraft.latest_validation);
  const [job, setJob] = useState<GenerationJob | undefined>();
  const [working, setWorking] = useState<"validate" | "generate" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isValidating = working === "validate";
  const isGenerating = working === "generate";
  const canGenerate = validation?.outcome !== "blocked" && !isGenerating;

  async function refreshDraft() {
    const response = await fetch(`/api/v1/site-creation/drafts/${draft.id}`);
    if (response.ok) {
      const payload = (await response.json()) as CmsSiteDraft;
      setDraft(payload);
      setValidation(payload.latest_validation);
    }
  }

  async function validatePlan() {
    setWorking("validate");
    setError(null);

    try {
      const response = await fetch(`/api/v1/site-creation/drafts/${draft.id}/validate`, {
        method: "POST"
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error?.message ?? "Validation failed.");
        return;
      }
      setValidation(payload);
      await refreshDraft();
    } catch {
      setError("Validation failed.");
    } finally {
      setWorking(null);
    }
  }

  async function generateDocuments() {
    setWorking("generate");
    setError(null);

    try {
      const response = await fetch(`/api/v1/site-creation/drafts/${draft.id}/generate`, {
        method: "POST"
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload.error?.message ?? "Document generation failed.");
        return;
      }
      setJob(payload);
      await refreshDraft();
    } catch {
      setError("Document generation failed.");
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="pt-6 px-3 lg:px-6 pb-4">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 mb-1">Generation Plan: {draft.site_name}</h1>
            <p className="text-sm text-stone-600">
              Review selected domains, auto-added dependencies, validation results, and generated bundles.
            </p>
          </div>
          <Badge variant={draft.status === "blocked" ? "danger" : draft.status === "generated" ? "success" : "neutral"}>
            {draft.status.replaceAll("_", " ")}
          </Badge>
        </div>
        <div className="border-b border-stone-200 mt-4" />
      </div>

      <div className="p-6 space-y-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <DomainSummary title="Selected" values={draft.selected_domains} variant="info" />
          <DomainSummary title="Auto-added" values={draft.auto_added_domains} variant="warning" />
          <DomainSummary title="Effective" values={draft.effective_domains} variant="success" />
        </section>

        <section className="rounded-lg border border-stone-200 bg-white">
          <div className="p-6 border-b border-stone-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg mr-3 bg-stone-900 text-white flex items-center justify-center">
                <GitCommitHorizontal className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-stone-900">Stage Timeline</h2>
                <p className="text-sm text-stone-600 mt-1">Dependency-aligned generation_order for this draft.</p>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {draft.generation_stages.length === 0 ? (
              <div className="md:col-span-2 xl:col-span-3 rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center text-sm text-stone-600">
                No generation stages have been resolved yet.
              </div>
            ) : null}
            {draft.generation_stages.map((stage) => (
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-4" key={stage.stage_number}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-stone-900">Stage {stage.stage_number}</h3>
                  <Badge variant="neutral">{stage.domain_codes.length} domains</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  {stage.domain_codes.map((domainCode) => (
                    <Badge key={domainCode} variant="secondary">
                      {domainCode}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-stone-500 mt-3 leading-relaxed">{stage.dependency_summary}</p>
              </div>
            ))}
          </div>
        </section>

        <DependencyGraph domains={domains} stages={draft.generation_stages} />
        <ValidationPanel report={validation} />
        <GenerationProgressPanel draft={draft} job={job} />

        <section className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-stone-900 mb-1">Document Review</h2>
              <p className="text-sm text-stone-600">Review spec.md, plan.md, and tasks.md before handoff approval.</p>
            </div>
            <Badge variant={draft.document_bundles.length > 0 ? "success" : "neutral"}>
              {draft.document_bundles.length} bundles
            </Badge>
          </div>

          {draft.document_bundles.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {draft.document_bundles.map((bundle) => (
                <DocumentBundleCard bundle={bundle} key={bundle.id} onRetry={generateDocuments} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-6 py-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-white text-stone-700 ring-1 ring-stone-200">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-stone-900">No generated documents yet</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                Generate documents after validation passes to reveal domain bundles and review tabs.
              </p>
            </div>
          )}
        </section>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <Button asChild variant="secondary">
            <Link href="/site-creation">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button disabled={isValidating} onClick={validatePlan} type="button" variant="secondary">
              {isValidating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
              Validate Plan
            </Button>
            <Button disabled={!canGenerate || isGenerating} onClick={generateDocuments} type="button">
              {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
              Generate Documents
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DomainSummary({
  title,
  values,
  variant
}: {
  title: string;
  values: string[];
  variant: "info" | "warning" | "success";
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-6">
      <div className="flex items-center mb-4">
        <div className="w-8 h-8 rounded-lg mr-3 bg-stone-900 text-white flex items-center justify-center">
          {title === "Effective" ? <CheckCircle2 className="h-4 w-4" /> : <FilePlus2 className="h-4 w-4" />}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-stone-900 mb-1">{title}</h2>
          <p className="text-xs text-stone-500">{values.length} domains</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.length > 0 ? (
          values.map((value) => (
            <Badge className="break-all" key={value} variant={variant}>
              {value}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-stone-500">None</span>
        )}
      </div>
    </div>
  );
}
