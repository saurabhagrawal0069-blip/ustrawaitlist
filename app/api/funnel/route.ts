import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const VISIT_ID = /^[A-Za-z0-9-]{8,64}$/;
const STAGES = ['view', 'play', 'join', 'submit'];
const KINDS = ['', 'customer', 'business'];

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ ok: false }, { status: 503 });

  const body = await request.json().catch(() => null);
  const visitId = typeof body?.visitId === 'string' ? body.visitId : '';
  const stage = typeof body?.stage === 'string' ? body.stage : '';
  const kind = typeof body?.kind === 'string' ? body.kind : '';
  const visitorId = typeof body?.visitorId === 'string' && VISIT_ID.test(body.visitorId) ? body.visitorId : null;
  if (!VISIT_ID.test(visitId) || !STAGES.includes(stage) || !KINDS.includes(kind)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  // The database keeps one row per visit, step and kind, so repeats are ignored.
  const { error } = await supabase.rpc('record_funnel_event', {
    _visit_id: visitId,
    _stage: stage,
    _kind: kind,
    _visitor_id: visitorId,
  });
  if (error) return NextResponse.json({ ok: false }, { status: 500 });
  return NextResponse.json({ ok: true });
}
