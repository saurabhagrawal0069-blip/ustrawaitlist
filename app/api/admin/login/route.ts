import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, adminSessionValue, safeEqual } from '@/lib/adminAuth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: 'Admin password is not set up yet.' }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!safeEqual(password, expected)) {
    // Slow down wrong guesses a little.
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return NextResponse.json({ error: 'Wrong password.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, await adminSessionValue(expected), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
  return response;
}
