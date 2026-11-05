// Admin login helpers. The password lives only in the ADMIN_PASSWORD secret.
// The browser receives a signed session value derived from it, never the password itself.

export const ADMIN_COOKIE = 'ustra_admin';

const SESSION_MESSAGE = 'ustra-admin-session-v1';

// Compares two strings without stopping at the first difference.
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Session value = HMAC of a fixed message, keyed by the admin password.
// Changing ADMIN_PASSWORD automatically signs everyone out.
export async function adminSessionValue(password: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(SESSION_MESSAGE));
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, '0')).join('');
}
