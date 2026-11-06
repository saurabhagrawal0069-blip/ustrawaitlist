// Turns raw video_views rows into the numbers the admin panel shows.
// Plain functions only, so this runs on the server and can be checked on its own.

export type VideoViewRow = {
  visit_id: string;
  first_seen: string;
  last_seen: string;
  plays: number | string | null;
  watched_seconds: number | string | null;
  max_position: number | string | null;
  video_duration: number | string | null;
  country: string | null;
  device: string | null;
};

export type DropOffPoint = { second: number; reached: number; percent: number };

export type RecentVisit = {
  firstSeen: string;
  country: string;
  device: string;
  plays: number;
  watched: number;
  reached: number;
  finished: boolean;
};

export type VideoStats = {
  visits: number;
  avgWatched: number;
  duration: number | null;
  completionRate: number;
  avgPercent: number | null;
  dropOff: DropOffPoint[];
  countries: [string, number][];
  devices: [string, number][];
  recent: RecentVisit[];
};

const toNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// Percentage with one decimal place. Returns 0 when there is nothing to divide by.
const pct = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0);

function tally(values: string[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

/** `rows` should be newest first, which is how the admin query returns them. */
export function summarizeVideoViews(rows: VideoViewRow[]): VideoStats {
  const visits = rows.length;

  // Every visit watches the same video, so use the longest length reported.
  const lengths = rows.map((r) => toNumber(r.video_duration)).filter((d) => d > 0);
  const duration = lengths.length ? Math.max(...lengths) : null;

  // "Finished" means the viewer got to within one second of the end.
  const finished = (r: VideoViewRow) => duration !== null && toNumber(r.max_position) >= duration - 1;

  const avgWatched = visits ? rows.reduce((sum, r) => sum + toNumber(r.watched_seconds), 0) / visits : 0;
  const completionRate = pct(rows.filter(finished).length, visits);
  const avgPercent =
    duration !== null && visits
      ? Math.round(
          (rows.reduce((sum, r) => sum + Math.min(toNumber(r.watched_seconds) / duration, 1), 0) / visits) * 1000,
        ) / 10
      : null;

  // About 20 points along the video, with the very end always included.
  const marks: number[] = [];
  if (duration !== null) {
    const step = Math.max(1, Math.ceil(duration / 20));
    for (let t = step; t < duration; t += step) marks.push(t);
    marks.push(duration);
  }
  const dropOff = marks.map((second) => {
    const reached = rows.filter((r) => toNumber(r.max_position) >= second - 1).length;
    return { second: Math.round(second * 10) / 10, reached, percent: pct(reached, visits) };
  });

  return {
    visits,
    avgWatched,
    duration,
    completionRate,
    avgPercent,
    dropOff,
    countries: tally(rows.map((r) => r.country || 'Unknown')).slice(0, 8),
    devices: tally(rows.map((r) => r.device || 'Unknown')),
    recent: rows.slice(0, 25).map((r) => ({
      firstSeen: r.first_seen,
      country: r.country || 'Unknown',
      device: r.device || 'Unknown',
      plays: toNumber(r.plays),
      watched: Math.round(toNumber(r.watched_seconds)),
      reached: Math.round(toNumber(r.max_position)),
      finished: finished(r),
    })),
  };
}
