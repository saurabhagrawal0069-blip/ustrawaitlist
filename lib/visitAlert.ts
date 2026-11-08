// Emails the admin when a new device opens the landing page. Uses the same Resend account as the waitlist emails.
// Needs RESEND_API_KEY, EMAIL_FROM and ADMIN_NOTIFY_EMAIL. Without them, nothing is sent and nothing fails.
// Only the country and device type are included. The IP address is never read or sent.

export type VisitAlert = {
  country: string | null; // from Cloudflare's country header, two letters
  userAgent: string | null;
  when: Date;
};

const COUNTRY = /^[A-Z]{2}$/;

const deviceOf = (userAgent: string | null) => (userAgent && /Mobi|Android|iPhone|iPad/i.test(userAgent) ? 'Mobile' : 'Desktop');

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

export function countryFromHeader(value: string | null): string | null {
  const code = (value || '').toUpperCase();
  return COUNTRY.test(code) ? code : null;
}

export async function sendVisitAlert(alert: VisitAlert): Promise<'sent' | 'skipped'> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const to = process.env.ADMIN_NOTIFY_EMAIL;
  if (!apiKey || !from || !to) return 'skipped';

  const when = alert.when.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });
  const country = alert.country ?? 'Unknown';
  const device = deviceOf(alert.userAgent);
  const subject = `New visitor on USTRA · ${device} · ${country}`;
  const html = `<p>A new device just opened the USTRA page.</p>
<ul>
  <li>Time: ${escapeHtml(when)} (India time)</li>
  <li>Device: ${escapeHtml(device)}</li>
  <li>Country: ${escapeHtml(country)}</li>
</ul>
<p>Repeat visits from the same phone or browser do not send another email.</p>`;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from, to: [to], subject, html }),
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`Resend error: ${await response.text()}`);
  return 'sent';
}
