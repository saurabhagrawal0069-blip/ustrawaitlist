// Turns funnel_counts() rows into the steps the admin panel shows. Plain functions only.

export type FunnelRow = {
  stage_name: string;
  kind_name: string;
  visit_count: number | string | null;
};

export type FunnelStep = {
  label: string;
  count: number; // different devices (browsers) that reached this step
  visits: number; // page loads that reached this step. Reopening the page makes a new visit.
  percent: number; // share of all devices that landed on the page
  breakdown: { label: string; count: number }[];
};

export type FunnelSummary = {
  steps: FunnelStep[];
  formToSubmit: number; // share of devices that opened the form and submitted it
};

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

export function summarizeFunnel(rows: FunnelRow[]): FunnelSummary {
  // kind_name 'devices' counts different devices at a step. 'all' counts every visit (page load).
  // Other kind_name values ('customer', 'business') are devices at a step, split by kind.
  const sum = (stage: string, kind: string) =>
    rows
      .filter((r) => r.stage_name === stage && r.kind_name === kind)
      .reduce((total, r) => total + toNumber(r.visit_count), 0);

  const byKind = (stage: string) =>
    [
      { kind: 'customer', label: 'Customers' },
      { kind: 'business', label: 'Businesses' },
    ].map(({ kind, label }) => ({ label, count: sum(stage, kind) }));

  const devices = sum('view', 'devices');
  const steps: FunnelStep[] = [
    { label: 'Visited the page', count: devices, visits: sum('view', 'all'), breakdown: [] },
    { label: 'Played the video', count: sum('play', 'devices'), visits: sum('play', 'all'), breakdown: [] },
    { label: 'Opened the join form', count: sum('join', 'devices'), visits: sum('join', 'all'), breakdown: byKind('join') },
    { label: 'Submitted the form', count: sum('submit', 'devices'), visits: sum('submit', 'all'), breakdown: byKind('submit') },
  ].map((step) => ({ ...step, percent: pct(step.count, devices) }));

  return {
    steps,
    formToSubmit: pct(sum('submit', 'devices'), sum('join', 'devices')),
  };
}
