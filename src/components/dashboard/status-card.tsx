import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatusCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "neutral"
}: {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "text-blue-500 bg-blue-100",
    success: "text-green-600 bg-green-100",
    warning: "text-yellow-600 bg-yellow-100",
    danger: "text-red-600 bg-red-100"
  }[tone];

  return (
    <Card>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 mb-1">{title}</h3>
            <p className="text-xs text-stone-500">{description}</p>
          </div>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", toneClass)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-3xl font-bold text-stone-900">{value}</div>
        <div className="flex items-center text-xs text-stone-500 mt-4">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
          Updated from draft history
        </div>
      </CardContent>
    </Card>
  );
}
