import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSignupCount } from '@/lib/signupCount';

export const runtime = 'nodejs';

// Only the total is public. The browser and CDN may reuse it for up to a minute.
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return NextResponse.json({ error: 'unavailable' }, { status: 503 });

  try {
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { total } = await getSignupCount(supabase);
    return NextResponse.json(
      { total, asOf: new Date().toISOString() },
      { headers: { 'Cache-Control': 'public, max-age=60' } },
    );
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 500 });
  }
}
