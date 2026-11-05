import type { Metadata } from 'next';
import type { CSSProperties, ReactNode } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import AdminLogin from './AdminLogin';
import LogoutButton from './LogoutButton';
import { ADMIN_COOKIE, adminSessionValue, safeEqual } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Row = Record<string, any>;

const pageStyle: CSSProperties = { minHeight: '100vh', background: '#0b0b0c', color: '#f5f1ea', fontFamily: 'Inter, system-ui, sans-serif', padding: '32px 20px' };
const cellStyle: CSSProperties = { borderBottom: '1px solid #26262b', padding: '10px 8px', textAlign: 'left', verticalAlign: 'top' };
const headStyle: CSSProperties = { ...cellStyle, color: '#d7a52e', fontWeight: 600, whiteSpace: 'nowrap' };

function Shell({ children }: { children: ReactNode }) {
  return (
    <main style={pageStyle}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>{children}</div>
    </main>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  if (rows.length === 0) return <p style={{ color: '#9a968e' }}>No registrations yet.</p>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 12 }}>
        <thead>
          <tr>{headers.map((h) => <th key={h} style={headStyle}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j} style={cellStyle}>{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const yesNo = (value: boolean) => (value ? 'Yes' : 'No');
const when = (value: string) => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
const text = (value: unknown) => (value === null || value === undefined || value === '' ? '—' : String(value));

export default async function AdminPage() {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return (
      <Shell>
        <h1>Admin</h1>
        <p style={{ color: '#9a968e' }}>ADMIN_PASSWORD is not set. Add it as a secret in Cloudflare, then redeploy.</p>
      </Shell>
    );
  }

  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  const signedIn = !!session && safeEqual(session, await adminSessionValue(expected));
  if (!signedIn) {
    return (
      <Shell>
        <h1 style={{ fontSize: 28, margin: 0 }}>Waitlist admin</h1>
        <AdminLogin />
      </Shell>
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return (
      <Shell>
        <p>Supabase settings are missing.</p>
        <LogoutButton />
      </Shell>
    );
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const [customersRes, businessesRes] = await Promise.all([
    supabase
      .from('customers')
      .select('waitlist_number, full_name, phone, email, city, locality, services, email_consent, whatsapp_consent, created_at')
      .order('waitlist_number', { ascending: true }),
    supabase
      .from('businesses')
      .select('waitlist_number, owner_name, business_name, business_type, phone, email, city, locality, verification_status, email_consent, whatsapp_consent, created_at')
      .order('waitlist_number', { ascending: true }),
  ]);

  const customers: Row[] = (customersRes.data ?? []) as Row[];
  const businesses: Row[] = (businessesRes.data ?? []) as Row[];
  const loadError = customersRes.error ?? businessesRes.error;

  const customerRows = customers.map((c) => [
    text(c.waitlist_number), text(c.full_name), text(c.phone), text(c.email), text(c.city), text(c.locality),
    Array.isArray(c.services) && c.services.length ? c.services.join(', ') : '—',
    yesNo(c.email_consent), yesNo(c.whatsapp_consent), when(c.created_at),
  ]);
  const businessRows = businesses.map((b) => [
    text(b.waitlist_number), text(b.owner_name), text(b.business_name), text(b.business_type), text(b.phone),
    text(b.email), text(b.city), text(b.locality), text(b.verification_status),
    yesNo(b.email_consent), yesNo(b.whatsapp_consent), when(b.created_at),
  ]);

  return (
    <Shell>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Waitlist admin</h1>
        <LogoutButton />
      </div>
      <p style={{ color: '#9a968e' }}>Customers: {customers.length} · Businesses: {businesses.length}</p>
      {loadError && <p style={{ color: '#ff8a80' }}>Could not load data: {loadError.message}</p>}

      <h2 style={{ marginTop: 32, color: '#ffd95e' }}>Customers</h2>
      <Table
        headers={['#', 'Name', 'Phone', 'Email', 'City', 'Locality', 'Services', 'Email OK', 'WhatsApp OK', 'Signed up']}
        rows={customerRows}
      />

      <h2 style={{ marginTop: 40, color: '#ffd95e' }}>Businesses</h2>
      <Table
        headers={['#', 'Owner', 'Business', 'Type', 'Phone', 'Email', 'City', 'Locality', 'Status', 'Email OK', 'WhatsApp OK', 'Signed up']}
        rows={businessRows}
      />
    </Shell>
  );
}
