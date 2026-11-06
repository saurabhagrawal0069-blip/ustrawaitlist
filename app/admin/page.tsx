import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import AdminLogin from './AdminLogin';
import AdminDashboard, { type BusinessRow, type CustomerRow } from './AdminDashboard';
import { ADMIN_COOKIE, adminSessionValue, safeEqual } from '@/lib/adminAuth';
import { splitVideoRows, summarizeVideoViews, type VideoViewRow } from '@/lib/videoStats';
import VideoInsights from './VideoInsights';
import FunnelInsights from './FunnelInsights';
import { summarizeFunnel, type FunnelRow } from '@/lib/funnel';

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
  const [customersRes, businessesRes, videoRes, funnelRes] = await Promise.all([
    supabase
      .from('customers')
      .select('waitlist_number, full_name, phone, email, city, locality, services, email_consent, whatsapp_consent, created_at')
      .order('waitlist_number', { ascending: true }),
    supabase
      .from('businesses')
      .select('waitlist_number, owner_name, business_name, business_type, phone, email, city, locality, verification_status, email_consent, whatsapp_consent, created_at')
      .order('waitlist_number', { ascending: true }),
    supabase
      .from('video_views')
      .select('visit_id, first_seen, last_seen, plays, watched_seconds, max_position, video_duration, country, device')
      .order('first_seen', { ascending: false })
      .limit(1000),
    supabase.rpc('funnel_counts'),
  ]);

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

  const funnelPanel = funnelRes.error ? (
    <p className="adm-error">Could not load funnel data: {funnelRes.error.message}</p>
  ) : (
    <FunnelInsights summary={summarizeFunnel((funnelRes.data ?? []) as FunnelRow[])} />
  );

  const { narrated, short } = splitVideoRows((videoRes.data ?? []) as VideoViewRow[]);
  const videoPanel = videoRes.error ? (
    <p className="adm-error">Could not load video data: {videoRes.error.message}</p>
  ) : (
    <>
      <VideoInsights title="Narrated promo" stats={summarizeVideoViews(narrated)} />
      <VideoInsights title="Short film" stats={summarizeVideoViews(short)} />
    </>
  );

  const insights = (
    <div className="adm-insights">
      {funnelPanel}
      {videoPanel}
    </div>
  );

  return (
    <main className="adm-page">
      <div className="adm-wrap">
        <AdminDashboard customers={customers} businesses={businesses} loadError={loadError} insights={insights} />
      </div>
    </main>
  );
}
