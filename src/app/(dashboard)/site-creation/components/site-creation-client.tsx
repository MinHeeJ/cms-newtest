"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DomainDefinition } from "@/lib/site-creation/types";
import { slugifySiteName } from "@/lib/utils";
import { DomainPicker } from "./domain-picker";
import { SiteDetailsForm, type SiteDetailsValue } from "./site-details-form";

export function SiteCreationClient() {
  const router = useRouter();
  const [details, setDetails] = useState<SiteDetailsValue>({
    site_name: "",
    description: "",
    target_audience: ""
  });
  const [domains, setDomains] = useState<DomainDefinition[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugPreview = useMemo(() => slugifySiteName(details.site_name), [details.site_name]);
  const canContinue = details.site_name.trim().length > 0 && selected.length > 0 && !submitting;

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      setLoadingOptions(true);
      const response = await fetch("/api/v1/site-creation/options");
      const payload = (await response.json()) as { domains: DomainDefinition[] };
      if (!cancelled) {
        setDomains(payload.domains);
        setLoadingOptions(false);
      }
    }

    loadOptions().catch(() => {
      if (!cancelled) {
        setError("Domain options could not be loaded.");
        setLoadingOptions(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function toggleDomain(domainCode: string) {
    setSelected((current) =>
      current.includes(domainCode) ? current.filter((item) => item !== domainCode) : [...current, domainCode]
    );
  }

  async function submit() {
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/site-creation/drafts", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          site_name: details.site_name,
          site_slug: slugPreview || undefined,
          description: details.description,
          target_audience: details.target_audience,
          selected_domains: selected
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload.error?.message ?? "Draft creation failed.");
        return;
      }

      router.push(`/site-creation/${payload.id}`);
    } catch {
      setError("Draft creation failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="pt-6 px-3 lg:px-6 pb-4">
        <h1 className="text-xl font-semibold text-stone-900 mb-1">Create CMS Site</h1>
        <p className="text-sm text-stone-600">
          Create a draft, resolve required domains, and review the generation plan before documents are produced.
        </p>
        <div className="border-b border-stone-200 mt-4" />
      </div>

      <div className="p-6 space-y-6">
        <SiteDetailsForm onChange={setDetails} slugPreview={slugPreview} value={details} />

        {loadingOptions ? (
          <div className="rounded-lg border border-stone-200 bg-white">
            <div className="p-6 border-b border-stone-200">
              <div className="flex items-center">
                <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-stone-900">CMS Domains</h2>
                  <p className="text-sm text-stone-600 mt-1">Resolving selectable domains without shifting the form.</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6" aria-busy="true" aria-live="polite">
              <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading CMS domains
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div className="rounded-lg border border-stone-200 bg-white p-4" key={index}>
                    <div className="mb-3 h-4 w-2/5 animate-pulse rounded bg-stone-200" />
                    <div className="h-3 w-full animate-pulse rounded bg-stone-100" />
                    <div className="mt-2 h-3 w-3/4 animate-pulse rounded bg-stone-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <DomainPicker domains={domains} onToggle={toggleDomain} selected={selected} />
        )}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        ) : null}

        <div className="flex items-center justify-between">
          <Button asChild variant="secondary">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Link>
          </Button>
          <Button disabled={!canContinue} onClick={submit} type="button">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
