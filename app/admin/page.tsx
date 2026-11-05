import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import AdminLogin from './AdminLogin';
import AdminDashboard, { type BusinessRow, type CustomerRow, type VideoStat } from './AdminDashboard';
import { ADMIN_COOKIE, adminSessionValue, safeEqual } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Row = Record<string, any>;

function Frame({ children }: { children: ReactNode }) {
  return (
    <main className="adm-page">
      <div className="adm-wrap">
        <header className="adm-top">
          <div className="adm-brand-row">
            <span className="adm-brand">USTRA</span>
            <span className="adm-badge">Admin</span>
          </div>
        </header>
        {children}
      </div>
    </main>
  );
}

const text = (value: unknown) => (value === null || value === undefined || value === '' ? '—' : String(value));

const when = (value: unknown) => {
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
};

export default async function AdminPage() {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return (
      <Frame>
        <h1 className="adm-title">Admin</h1>
        <p className="adm-sub">ADMIN_PASSWORD is not set. Add it as a secret in Cloudflare, then redeploy.</p>
      </Frame>
    );
  }

  const session = (await cookies()).get(ADMIN_COOKIE)?.value;
  const signedIn = !!session && safeEqual(session, await adminSessionValue(expected));
  if (!signedIn) {
    return (
      <Frame>
        <h1 className="adm-title">Waitlist admin</h1>
        <AdminLogin />
      </Frame>
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return (
      <Frame>
        <p className="adm-error">Supabase settings are missing.</p>
      </Frame>
    );
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const [customersRes, businessesRes, videoRes] = await Promise.all([
    supabase
      .from('customers')
      .select('waitlist_number, full_name, phone, email, city, locality, services, email_consent, whatsapp_consent, created_at')
      .order('waitlist_number', { ascending: true }),
    supabase
      .from('businesses')
      .select('waitlist_number, owner_name, business_name, business_type, phone, email, city, locality, verification_status, email_consent, whatsapp_consent, created_at')
      .order('waitlist_number', { ascending: true }),
    // Video stats come from a database function (see supabase/video_events.sql). Kept separate so a problem here never hides the signups.
    supabase.rpc('video_clip_stats'),
  ]);

  const videoStats: VideoStat[] = ((videoRes.data ?? []) as Row[]).map((v) => ({
    clipId: String(v.clip_id),
    viewers: Number(v.viewers ?? 0),
    unmuted: Number(v.unmuted ?? 0),
    completed: Number(v.completed ?? 0),
    avgWatched: Number(v.avg_watched_seconds ?? 0),
  }));
  const videoError = videoRes.error?.message ?? null;

  const customers: CustomerRow[] = ((customersRes.data ?? []) as Row[]).map((c) => ({
    number: text(c.waitlist_number),
    name: text(c.full_name),
    phone: text(c.phone),
    email: text(c.email),
    city: text(c.city),
    locality: text(c.locality),
    services: Array.isArray(c.services) && c.services.length ? c.services.join(', ') : '—',
    emailOk: !!c.email_consent,
    whatsappOk: !!c.whatsapp_consent,
    signedUp: when(c.created_at),
  }));

  const businesses: BusinessRow[] = ((businessesRes.data ?? []) as Row[]).map((b) => ({
    number: text(b.waitlist_number),
    owner: text(b.owner_name),
    business: text(b.business_name),
    type: text(b.business_type),
    phone: text(b.phone),
    email: text(b.email),
    city: text(b.city),
    locality: text(b.locality),
    status: text(b.verification_status),
    emailOk: !!b.email_consent,
    whatsappOk: !!b.whatsapp_consent,
    signedUp: when(b.created_at),
  }));

  const loadError = customersRes.error?.message ?? businessesRes.error?.message ?? null;

  return (
    <main className="adm-page">
      <div className="adm-wrap">
        <AdminDashboard
          customers={customers}
          businesses={businesses}
          loadError={loadError}
          videoStats={videoStats}
          videoError={videoError}
        />
      </div>
    </main>
  );
}
