import type { SignupCount } from '@/lib/signupCount';

const when = (value: string | null) =>
  value
    ? new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
    : 'No signups yet';

/** The number visitors see on the waitlist page, shown here so you can compare it with the live data. */
export default function PublicCount({ count, asOf }: { count: SignupCount; asOf: string }) {
  return (
    <section className="adm-panel" aria-labelledby="public-count-title">
      <div className="adm-video-head">
        <h2 id="public-count-title">Landing page counter</h2>
        <p className="adm-muted">
          This is the number visitors see on the waitlist page. The page refreshes it at most once a minute.
        </p>
      </div>
      <div className="adm-video-body">
        <ul className="adm-list">
          <li>
            <span>Shown on the page</span>
            <strong>{count.total.toLocaleString('en-IN')}</strong>
          </li>
          <li>
            <span>Customers / Businesses</span>
            <span>
              {count.customers} / {count.businesses}
            </span>
          </li>
          <li>
            <span>Last signup</span>
            <span>{when(count.lastSignupAt)}</span>
          </li>
          <li>
            <span>Counted at</span>
            <span>{when(asOf)}</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
