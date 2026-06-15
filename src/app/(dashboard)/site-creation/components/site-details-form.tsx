"use client";

import { FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export interface SiteDetailsValue {
  site_name: string;
  description: string;
  target_audience: string;
}

export function SiteDetailsForm({
  value,
  slugPreview,
  onChange
}: {
  value: SiteDetailsValue;
  slugPreview: string;
  onChange: (value: SiteDetailsValue) => void;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-lg mr-3 bg-stone-900 text-white flex items-center justify-center">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-stone-900">Site Details</h2>
            <p className="text-sm text-stone-600 mt-1">Name, slug, and audience context for generated drafts.</p>
          </div>
        </div>
      </div>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="site_name">Site name</Label>
          <Input
            id="site_name"
            maxLength={120}
            onChange={(event) => onChange({ ...value, site_name: event.target.value })}
            placeholder="example"
            value={value.site_name}
          />
          <div className="text-xs text-stone-500">
            Slug preview: <span className="font-mono text-stone-700">{slugPreview || "cms-site"}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="target_audience">Target audience</Label>
          <Input
            id="target_audience"
            maxLength={500}
            onChange={(event) => onChange({ ...value, target_audience: event.target.value })}
            placeholder="Editorial administrators"
            value={value.target_audience}
          />
        </div>

        <div className="space-y-3 lg:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            maxLength={1000}
            onChange={(event) => onChange({ ...value, description: event.target.value })}
            placeholder="A structured editorial CMS for publishing teams."
            value={value.description}
          />
        </div>
      </div>
    </div>
  );
}
