// Browser-side tracking. No names, phone numbers or IP addresses are sent from here.
// Two random ids are used:
// - visit id: new on every page load. Links the video and the funnel steps of one visit.
// - visitor id: kept in this browser (localStorage). Lets a later registration be linked to earlier visits.

export type FunnelStage = 'view' | 'play' | 'join' | 'submit';
export type FunnelKind = '' | 'customer' | 'business';

const VISITOR_KEY = 'ustra-vid';
const ID_PATTERN = /^[A-Za-z0-9-]{8,64}$/;

let currentVisitId: string | null = null;
let currentVisitorId: string | null = null;

function newId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

/** A random id for this page load. The video and the funnel share it, so the admin can join the two. */
export function getVisitId(): string {
  if (currentVisitId) return currentVisitId;
  currentVisitId = newId();
  return currentVisitId;
}

/**
 * An id that stays with this browser across visits. The waitlist form sends it, so the admin can link a
 * registration to the pages and videos seen in the same browser. If storage is blocked, it lasts for this page load only.
 */
export function getVisitorId(): string {
  if (currentVisitorId) return currentVisitorId;
  let id: string | null = null;
  try {
    const stored = window.localStorage.getItem(VISITOR_KEY);
    if (stored && ID_PATTERN.test(stored)) {
      id = stored;
    } else {
      id = newId();
      window.localStorage.setItem(VISITOR_KEY, id);
    }
  } catch {
    // Private browsing or blocked storage: fall back to an id for this page load.
  }
  currentVisitorId = id ?? newId();
  return currentVisitorId;
}

/** Records one step of the funnel. It never throws and never blocks the page. */
export function trackStep(stage: FunnelStage, kind: FunnelKind = '') {
  try {
    const body = JSON.stringify({ visitId: getVisitId(), visitorId: getVisitorId(), stage, kind });
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
