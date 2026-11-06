// Joins waitlist registrations with the page activity recorded in the same browser.
// Plain functions only, so this runs on the server and can be checked on its own.

export type JourneyRow = {
  visitor_id: string;
  first_seen: string | null;
  last_seen: string | null;
  visits: number | string | null;
  opened_form: boolean | null;
  plays: number | string | null;
  watched_seconds: number | string | null;
};

export type Journey = {
  firstSeen: string | null;
  lastSeen: string | null;
  visits: number;
  openedForm: boolean;
  plays: number;
  watched: number;
};

export type Registrant = {
  id: string; // waitlist ID, e.g. UST-C-000007
  kind: 'customer' | 'business';
  visitorId: string | null;
  name: string;
  business: string; // '—' for customers
  phone: string;
  city: string;
  signedUp: string; // ISO timestamp
};

export type LinkedRegistrant = Registrant & { journey: Journey };

export type VisitorSummary = {
  tracked: number; // browsers with any recorded activity
  registered: number; // registrations linked to a recorded browser
  conversion: number; // registered / tracked, in percent with one decimal place
  watched: number; // linked registrations that played a video
  unlinked: number; // registrations with no recorded browser
  rows: LinkedRegistrant[]; // newest registration first
};

const toNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** One entry per browser id, from the visitor_journeys() database function. */
export function indexJourneys(rows: JourneyRow[]): Map<string, Journey> {
  const journeys = new Map<string, Journey>();
  for (const row of rows) {
    journeys.set(row.visitor_id, {
      firstSeen: row.first_seen,
      lastSeen: row.last_seen,
      visits: toNumber(row.visits),
      openedForm: row.opened_form === true,
      plays: toNumber(row.plays),
      watched: toNumber(row.watched_seconds),
    });
  }
  return journeys;
}

/** Counts for the admin panel, and the list of registrations that can be linked to a visit. */
export function summarizeVisitorJourneys(registrants: Registrant[], journeys: Map<string, Journey>): VisitorSummary {
  const rows: LinkedRegistrant[] = [];
  for (const person of registrants) {
    const journey = person.visitorId ? journeys.get(person.visitorId) : undefined;
    if (journey) rows.push({ ...person, journey });
  }
  rows.sort((a, b) => (Date.parse(b.signedUp) || 0) - (Date.parse(a.signedUp) || 0));

  const tracked = journeys.size;
  return {
    tracked,
    registered: rows.length,
    conversion: tracked > 0 ? Math.round((rows.length / tracked) * 1000) / 10 : 0,
    watched: rows.filter((row) => row.journey.plays > 0).length,
    unlinked: registrants.length - rows.length,
    rows,
  };
}
