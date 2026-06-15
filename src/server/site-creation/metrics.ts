export interface SiteCreationMetric {
  name: string;
  value: number;
  labels?: Record<string, string>;
  recorded_at: string;
}

const metrics: SiteCreationMetric[] = [];

export function recordSiteCreationMetric(name: string, value: number, labels?: Record<string, string>) {
  metrics.push({
    name,
    value,
    labels,
    recorded_at: new Date().toISOString()
  });
}

export function listSiteCreationMetrics() {
  return [...metrics];
}
