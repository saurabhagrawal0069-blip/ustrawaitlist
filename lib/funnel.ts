// Turns funnel_counts() rows into the steps the admin panel shows. Plain functions only.

export type FunnelRow = {
  stage_name: string;
  kind_name: string;
  visit_count: number | string | null;
};

export type FunnelStep = {
  label: string;
  count: number;
  percent: number; // share of everyone who landed on the page
  breakdown: { label: string; count: number }[];
};

export type FunnelSummary = {
  steps: FunnelStep[];
  formToSubmit: number; // share of visitors who opened the form and submitted it
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

export function summarizeFunnel(rows: FunnelRow[]): FunnelSummary {
  // kind_name is 'all' for the overall count of distinct visitors at a step.
  const total = (stage: string) =>
    rows
      .filter((r) => r.stage_name === stage && r.kind_name === 'all')
      .reduce((sum, r) => sum + toNumber(r.visit_count), 0);

  const byKind = (stage: string) =>
    [
      { kind: 'customer', label: 'Customers' },
      { kind: 'business', label: 'Businesses' },
    ].map(({ kind, label }) => ({
      label,
      count: rows
        .filter((r) => r.stage_name === stage && r.kind_name === kind)
        .reduce((sum, r) => sum + toNumber(r.visit_count), 0),
    }));

  const visitors = total('view');
  const steps: FunnelStep[] = [
    { label: 'Visited the page', count: visitors, breakdown: [] },
    { label: 'Played the video', count: total('play'), breakdown: [] },
    { label: 'Opened the join form', count: total('join'), breakdown: byKind('join') },
    { label: 'Submitted the form', count: total('submit'), breakdown: byKind('submit') },
  ].map((step) => ({ ...step, percent: pct(step.count, visitors) }));

  return {
    steps,
    formToSubmit: pct(total('submit'), total('join')),
  };
}
