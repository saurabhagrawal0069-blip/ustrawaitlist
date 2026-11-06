import type { VisitorSummary } from '@/lib/visitorJourney';

const seconds = (s: number) => {
  const total = Math.max(0, Math.round(s));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes}m ${rest}s` : `${rest}s`;
};

const when = (value: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="adm-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

/** Admin view of people who browsed or watched on the same browser before registering. */
export default function VisitorJourney({ summary }: { summary: VisitorSummary }) {
  return (
    <section className="adm-panel adm-video" aria-labelledby="visitor-journey">
      <div className="adm-video-head">
        <h2 id="visitor-journey">Registered visitors</h2>
        <p className="adm-muted">
          People whose browser viewed the page or watched a video, and who then registered. They are linked by a random id
          kept in that browser. Registrations made before this update, or from another browser, cannot be linked.
        </p>
      </div>

      <div className="adm-stats adm-stats-4">
        <Stat label="Tracked visitors" value={summary.tracked} />
        <Stat label="Registered after a visit" value={summary.registered} />
        <Stat label="Sign-up rate" value={`${summary.conversion}%`} />
        <Stat label="Registered and watched a video" value={summary.watched} />
      </div>
      <p className="adm-muted">Registrations not linked to any visit: {summary.unlinked}</p>

      {summary.rows.length === 0 ? (
        <p className="adm-empty">No registration is linked to a visit yet.</p>
      ) : (
        <div className="adm-scroll">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Registered</th>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Phone</th>
                <th>City</th>
                <th>First visit</th>
                <th>Visits</th>
                <th>Opened form</th>
                <th>Plays</th>
                <th>Watched</th>
              </tr>
            </thead>
            <tbody>
              {summary.rows.map((row) => (
                <tr key={row.id}>
                  <td className="adm-muted">{when(row.signedUp)}</td>
                  <td>{row.id}</td>
                  <td>{row.name}</td>
                  <td>
                    {row.kind === 'customer' ? 'Customer' : 'Business'}
                    {row.business !== '—' ? <span className="adm-muted"> · {row.business}</span> : null}
                  </td>
                  <td>{row.phone}</td>
                  <td>{row.city}</td>
                  <td className="adm-muted">{when(row.journey.firstSeen)}</td>
                  <td>{row.journey.visits}</td>
                  <td>
                    <span className={row.journey.openedForm ? 'adm-chip adm-chip-on' : 'adm-chip'}>
                      {row.journey.openedForm ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>{row.journey.plays}</td>
                  <td>{seconds(row.journey.watched)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
