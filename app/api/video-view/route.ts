import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

// Random id made in the visitor's browser for one page visit. It is not tied to a name or phone.
const VISIT_ID = /^[A-Za-z0-9-]{8,64}$/;
const COUNTRY = /^[A-Z]{2}$/;

// Keeps a number between 0 and max. Anything that is not a finite number becomes 0.
function num(value: unknown, max: number): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.min(Math.max(n, 0), max);
}

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ ok: false }, { status: 503 });

  const body = await request.json().catch(() => null);
  const visitId = typeof body?.visitId === 'string' ? body.visitId : '';
  if (!VISIT_ID.test(visitId)) return NextResponse.json({ ok: false }, { status: 400 });
  const visitorId = typeof body?.visitorId === 'string' && VISIT_ID.test(body.visitorId) ? body.visitorId : null;

  // Cloudflare sets this header to the visitor's country. Only the country is kept, never the IP address.
  const countryHeader = (request.headers.get('cf-ipcountry') || '').toUpperCase();
  const country = COUNTRY.test(countryHeader) ? countryHeader : null;
  const duration = num(body?.duration, 36000);

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await supabase.rpc('record_video_view', {
    _visit_id: visitId,
    _plays: Math.round(num(body?.plays, 1000)),
    _watched: num(body?.watched, 36000),
    _position: num(body?.position, 36000),
    _duration: duration > 0 ? duration : null,
    _country: country,
    _device: body?.device === 'mobile' ? 'mobile' : 'desktop',
    _visitor_id: visitorId,
  });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
