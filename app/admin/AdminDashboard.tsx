'use client';

import { useMemo, useState } from 'react';
import LogoutButton from './LogoutButton';

export type CustomerRow = {
  number: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  services: string;
  emailOk: boolean;
  whatsappOk: boolean;
  signedUp: string;
};

export type BusinessRow = {
  number: string;
  owner: string;
  business: string;
  type: string;
  phone: string;
  email: string;
  city: string;
  locality: string;
  status: string;
  emailOk: boolean;
  whatsappOk: boolean;
  signedUp: string;
};

type Tab = 'customers' | 'businesses';

const shown = (value: string) => (value && value !== '—' ? value : '');

function Chip({ on, label }: { on: boolean; label: string }) {
  return <span className={on ? 'adm-chip adm-chip-on' : 'adm-chip'}>{label}</span>;
}

function Consent({ emailOk, whatsappOk }: { emailOk: boolean; whatsappOk: boolean }) {
  return (
    <>
      <Chip on={emailOk} label="Email" />
      <Chip on={whatsappOk} label="WhatsApp" />
    </>
  );
}

export default function AdminDashboard({
  customers,
  businesses,
  loadError,
}: {
  customers: CustomerRow[];
  businesses: BusinessRow[];
  loadError: string | null;
}) {
  const [tab, setTab] = useState<Tab>('customers');
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const visibleCustomers = useMemo(
    () =>
      q
        ? customers.filter((c) =>
            [c.name, c.phone, c.email, c.city, c.locality, c.services].join(' ').toLowerCase().includes(q),
          )
        : customers,
    [customers, q],
  );

  const visibleBusinesses = useMemo(
    () =>
      q
        ? businesses.filter((b) =>
            [b.business, b.owner, b.phone, b.email, b.city, b.locality, b.type, b.status]
              .join(' ')
              .toLowerCase()
              .includes(q),
          )
        : businesses,
    [businesses, q],
  );

  return (
    <>
      <header className="adm-top">
        <div className="adm-brand-row">
          <span className="adm-brand">USTRA</span>
          <span className="adm-badge">Admin</span>
        </div>
        <LogoutButton />
      </header>

      <h1 className="adm-title">Waitlist registrations</h1>
      <p className="adm-sub">All form entries in one place.</p>

      <div className="adm-stats">
        <div className="adm-stat">
          <span>Customers</span>
          <strong>{customers.length}</strong>
        </div>
        <div className="adm-stat">
          <span>Businesses</span>
          <strong>{businesses.length}</strong>
        </div>
        <div className="adm-stat">
          <span>Total signups</span>
          <strong>{customers.length + businesses.length}</strong>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-seg" role="tablist" aria-label="Registration type">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'customers'}
            className={tab === 'customers' ? 'is-on' : ''}
            onClick={() => setTab('customers')}
          >
            Customers
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'businesses'}
            className={tab === 'businesses' ? 'is-on' : ''}
            onClick={() => setTab('businesses')}
          >
            Businesses
          </button>
        </div>
        <input
          className="adm-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, city or phone"
          aria-label="Search registrations"
        />
      </div>

      {loadError && <p className="adm-error">Could not load data: {loadError}</p>}

      {tab === 'customers' && (
        <section className="adm-panel">
          {customers.length === 0 ? (
            <p className="adm-empty">No customer registrations yet.</p>
          ) : visibleCustomers.length === 0 ? (
            <p className="adm-empty">No customers match “{query}”.</p>
          ) : (
            <>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>City</th>
                      <th>Services</th>
                      <th>Consent</th>
                      <th>Signed up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCustomers.map((c, i) => (
                      <tr key={`${c.number}-${i}`}>
                        <td className="adm-muted">{c.number}</td>
                        <td>
                          <div className="adm-name">{c.name}</div>
                          {shown(c.email) && <div className="adm-muted">{c.email}</div>}
                        </td>
                        <td>{c.phone}</td>
                        <td>
                          {c.city}
                          {shown(c.locality) && <div className="adm-muted">{c.locality}</div>}
                        </td>
                        <td>{c.services}</td>
                        <td>
                          <Consent emailOk={c.emailOk} whatsappOk={c.whatsappOk} />
                        </td>
                        <td className="adm-muted">{c.signedUp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="adm-cards">
                {visibleCustomers.map((c, i) => (
                  <div className="adm-card-row" key={`${c.number}-${i}`}>
                    <div className="adm-card-top">
                      <span className="adm-name">{c.name}</span>
                      <span className="adm-num">#{c.number}</span>
                    </div>
                    <dl className="adm-kv">
                      <dt>Phone</dt>
                      <dd>{c.phone}</dd>
                      {shown(c.email) && (
                        <>
                          <dt>Email</dt>
                          <dd>{c.email}</dd>
                        </>
                      )}
                      <dt>City</dt>
                      <dd>{[shown(c.city), shown(c.locality)].filter(Boolean).join(', ') || '—'}</dd>
                      <dt>Services</dt>
                      <dd>{c.services}</dd>
                      <dt>Consent</dt>
                      <dd>
                        <Consent emailOk={c.emailOk} whatsappOk={c.whatsappOk} />
                      </dd>
                      <dt>Signed up</dt>
                      <dd>{c.signedUp}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {tab === 'businesses' && (
        <section className="adm-panel">
          {businesses.length === 0 ? (
            <p className="adm-empty">No business registrations yet.</p>
          ) : visibleBusinesses.length === 0 ? (
            <p className="adm-empty">No businesses match “{query}”.</p>
          ) : (
            <>
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Business</th>
                      <th>Owner / Phone</th>
                      <th>City</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Consent</th>
                      <th>Signed up</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleBusinesses.map((b, i) => (
                      <tr key={`${b.number}-${i}`}>
                        <td className="adm-muted">{b.number}</td>
                        <td>
                          <div className="adm-name">{b.business}</div>
                          {shown(b.email) && <div className="adm-muted">{b.email}</div>}
                        </td>
                        <td>
                          {b.owner}
                          <div className="adm-muted">{b.phone}</div>
                        </td>
                        <td>
                          {b.city}
                          {shown(b.locality) && <div className="adm-muted">{b.locality}</div>}
                        </td>
                        <td>{b.type}</td>
                        <td>
                          <span className="adm-tag">{b.status}</span>
                        </td>
                        <td>
                          <Consent emailOk={b.emailOk} whatsappOk={b.whatsappOk} />
                        </td>
                        <td className="adm-muted">{b.signedUp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="adm-cards">
                {visibleBusinesses.map((b, i) => (
                  <div className="adm-card-row" key={`${b.number}-${i}`}>
                    <div className="adm-card-top">
                      <span className="adm-name">{b.business}</span>
                      <span className="adm-num">#{b.number}</span>
                    </div>
                    <dl className="adm-kv">
                      <dt>Owner</dt>
                      <dd>{b.owner}</dd>
                      <dt>Phone</dt>
                      <dd>{b.phone}</dd>
                      {shown(b.email) && (
                        <>
                          <dt>Email</dt>
                          <dd>{b.email}</dd>
                        </>
                      )}
                      <dt>City</dt>
                      <dd>{[shown(b.city), shown(b.locality)].filter(Boolean).join(', ') || '—'}</dd>
                      <dt>Type</dt>
                      <dd>{b.type}</dd>
                      <dt>Status</dt>
                      <dd>
                        <span className="adm-tag">{b.status}</span>
                      </dd>
                      <dt>Consent</dt>
                      <dd>
                        <Consent emailOk={b.emailOk} whatsappOk={b.whatsappOk} />
                      </dd>
                      <dt>Signed up</dt>
                      <dd>{b.signedUp}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      )}
    </>
  );
}
