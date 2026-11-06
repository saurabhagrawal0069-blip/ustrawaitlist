// Browser-side tracking. Everything is anonymous: one random id per page load, no names or phone numbers.

export type FunnelStage = 'view' | 'play' | 'join' | 'submit';
export type FunnelKind = '' | 'customer' | 'business';

let currentVisitId: string | null = null;

/** A random id for this page load. The video and the funnel share it, so the admin can join the two. */
export function getVisitId(): string {
  if (currentVisitId) return currentVisitId;
  try {
    currentVisitId = crypto.randomUUID();
  } catch {
    currentVisitId = `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
  return currentVisitId;
}

/** Records one step of the funnel. It never throws and never blocks the page. */
export function trackStep(stage: FunnelStage, kind: FunnelKind = '') {
  try {
    const body = JSON.stringify({ visitId: getVisitId(), stage, kind });
    const queued = navigator.sendBeacon?.('/api/funnel', new Blob([body], { type: 'application/json' }));
    if (!queued) {
      fetch('/api/funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Tracking must never break the page.
  }
}
