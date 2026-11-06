import type { VideoStats } from '@/lib/videoStats';

const seconds = (s: number) => {
  const total = Math.max(0, Math.round(s));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
};

const when = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
};

function countryName(code: string) {
  if (code === 'Unknown') return code;
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code;
  } catch {
    return code;
  }
}

const deviceName = (device: string) =>
  device === 'mobile' ? 'Mobile' : device === 'desktop' ? 'Desktop' : device;

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="adm-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Breakdown({
  title,
  items,
  label,
}: {
  title: string;
  items: [string, number][];
  label: (key: string) => string;
}) {
  const total = items.reduce((sum, [, count]) => sum + count, 0);
  return (
    <div>
      <h3>{title}</h3>
      {items.length === 0 ? (
        <p className="adm-muted">No data yet.</p>
      ) : (
        <ul className="adm-list">
          {items.map(([key, count]) => (
            <li key={key}>
              <span>{label(key)}</span>
              <span className="adm-muted">
                {count} · {Math.round((count / total) * 100)}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Admin view of the promo video: how many people played it, how far they got, and where they are. */
export default function VideoInsights({ stats, title = 'Promo video' }: { stats: VideoStats; title?: string }) {
  const id = `video-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section className="adm-panel adm-video" aria-labelledby={id}>
      <div className="adm-video-head">
        <h2 id={id}>{title}</h2>
        <p className="adm-muted">
          Viewing data from the landing page. A view is linked to a registration only if the same browser later signs up. No IP addresses are stored.
        </p>
      </div>

      {stats.visits === 0 ? (
        <p className="adm-empty">No one has played the video yet.</p>
      ) : (
        <div className="adm-video-body">
          <div className="adm-stats adm-stats-4">
            <Stat label="Visits that played" value={stats.visits} />
            <Stat label="Avg. time watched" value={seconds(stats.avgWatched)} />
            <Stat label="Watched to the end" value={`${stats.completionRate}%`} />
            <Stat label="Avg. share of video" value={stats.avgPercent === null ? '—' : `${stats.avgPercent}%`} />
          </div>

          <h3>Drop-off: share of visits that reached each point</h3>
          <div className="adm-bars">
            {stats.dropOff.map((point) => (
              <div
                className="adm-bar-col"
                key={point.second}
                title={`${point.reached} visits reached ${point.second}s (${point.percent}%)`}
              >
                <div className="adm-bar-track">
                  <div className="adm-bar-fill" style={{ height: `${point.percent}%` }} />
                </div>
                <span>{point.second}s</span>
              </div>
            ))}
          </div>

          <div className="adm-split">
            <Breakdown title="Country" items={stats.countries} label={countryName} />
            <Breakdown title="Device" items={stats.devices} label={deviceName} />
          </div>

          <h3>Recent visits (India time)</h3>
          <div className="adm-scroll">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Country</th>
                  <th>Device</th>
                  <th>Plays</th>
                  <th>Watched</th>
                  <th>Reached</th>
                  <th>Finished</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((visit, i) => (
                  <tr key={`${visit.firstSeen}-${i}`}>
                    <td className="adm-muted">{when(visit.firstSeen)}</td>
                    <td>{countryName(visit.country)}</td>
                    <td>{deviceName(visit.device)}</td>
                    <td>{visit.plays}</td>
                    <td>{seconds(visit.watched)}</td>
                    <td>
                      {stats.duration ? `${visit.reached}s of ${stats.duration}s` : `${visit.reached}s`}
                    </td>
                    <td>
                      <span className={visit.finished ? 'adm-chip adm-chip-on' : 'adm-chip'}>
                        {visit.finished ? 'Yes' : 'No'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
