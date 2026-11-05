import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { VIDEO_CLIPS } from '@/lib/videoClips';

export const runtime = 'nodejs';

const EVENTS: readonly string[] = ['start', 'unmute', 'q25', 'q50', 'q75', 'complete', 'stop'];
const SESSION_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;
// Anti-spam: one network (hashed IP address) may send this many video events per hour.
const MAX_VIDEO_EVENTS_PER_HOUR = 2000;

function seconds(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 7200) : 0;
}

// Same approach as the waitlist form: a salted hash of the IP address, never the raw IP.
async function hashClientIp(request: Request, salt: string): Promise<string> {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ||
    'unknown';
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${salt}:${ip}`));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = typeof body?.session === 'string' ? body.session : '';
    const clip = typeof body?.clip === 'string' ? body.clip : '';
    const event = typeof body?.event === 'string' ? body.event : '';

    if (!SESSION_PATTERN.test(session)) return NextResponse.json({ error: 'Invalid session.' }, { status: 400 });
    if (!VIDEO_CLIPS.some((c) => c.id === clip)) return NextResponse.json({ error: 'Unknown clip.' }, { status: 400 });
    if (!EVENTS.includes(event)) return NextResponse.json({ error: 'Unknown event.' }, { status: 400 });

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const ipSalt = process.env.IP_HASH_SALT;
    if (!url || !serviceKey || !ipSalt) return NextResponse.json({ error: 'Not connected.' }, { status: 503 });

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const ipHash = await hashClientIp(request, ipSalt);

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('video_events')
      .select('id', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since);
    if (countError) {
      console.error('Video rate limit check failed:', countError);
      return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
    }
    if ((count ?? 0) >= MAX_VIDEO_EVENTS_PER_HOUR) {
      return NextResponse.json({ error: 'Too many events.' }, { status: 429 });
    }

    const { error } = await supabase.from('video_events').insert({
      session_id: session,
      clip_id: clip,
      event,
      position_seconds: seconds(body.position),
      watched_seconds: seconds(body.watched),
      ip_hash: ipHash,
    });
    if (error) {
      console.error('Video event insert failed:', error);
      return NextResponse.json({ error: 'Could not save.' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
}
