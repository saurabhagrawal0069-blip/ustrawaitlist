import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const CUSTOMER_SERVICES = ['Haircut', 'Beard styling', 'Shaving', 'Facial', 'Hair spa', 'Massage'];
const BUSINESS_TYPES = ['Barber Shop', 'Premium Salon', 'Unisex Salon', 'Grooming Studio', 'Independent Barber'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Anti-spam: one network (hashed IP address) may register this many times per hour, across both forms.
const MAX_REGISTRATIONS_PER_HOUR = 10;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// Returns digits only (with country code). A 10-digit number is treated as Indian (+91).
function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 10) digits = `91${digits}`;
  if (digits.length < 11 || digits.length > 15) return null;
  return digits;
}

// Returns a salted SHA-256 hash of the sender's IP address. The raw IP is never stored.
// On Cloudflare the real visitor IP arrives in the CF-Connecting-IP header.
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
    const kind = body?.kind;
    if (kind !== 'customer' && kind !== 'business') return bad('Please complete all required fields.');

    const name = clean(body.name, 100);
    const city = clean(body.city, 100);
    const locality = clean(body.locality, 100);
    const email = clean(body.email, 254);
    const businessName = clean(body.businessName, 150);
    const businessType = BUSINESS_TYPES.includes(body.businessType) ? body.businessType : 'Barber Shop';
    const services: string[] = Array.isArray(body.services)
      ? body.services.filter((s: unknown): s is string => typeof s === 'string' && CUSTOMER_SERVICES.includes(s))
      : [];
    const emailConsent = body.emailConsent === true;
    const whatsappConsent = body.whatsappConsent === true;

    if (!name || !city) return bad('Please complete all required fields.');
    const phoneDigits = normalizePhone(clean(body.phone, 30));
    if (!phoneDigits) return bad('Please enter a valid mobile number with country code.');
    if (email && !EMAIL_PATTERN.test(email)) return bad('Please enter a valid email address.');
    if (kind === 'business' && !businessName) return bad('Please enter your business name.');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const ipSalt = process.env.IP_HASH_SALT;
    if (!url || !serviceKey || !ipSalt) {
      return bad('The waitlist database is not connected yet. Add your Supabase settings and IP_HASH_SALT to .env.local.', 503);
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    // Rate limit: count this network's recent registrations across both tables.
    const ipHash = await hashClientIp(request, ipSalt);
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const [recentCustomers, recentBusinesses] = await Promise.all([
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('signup_ip_hash', ipHash).gte('created_at', since),
      supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('signup_ip_hash', ipHash).gte('created_at', since),
    ]);
    if (recentCustomers.error || recentBusinesses.error) {
      console.error('Rate limit check failed:', recentCustomers.error ?? recentBusinesses.error);
      return bad('Could not save your registration. Please try again.', 500);
    }
    if ((recentCustomers.count ?? 0) + (recentBusinesses.count ?? 0) >= MAX_REGISTRATIONS_PER_HOUR) {
      return bad('Too many registrations from this network. Please try again later.', 429);
    }

    const phone = `+${phoneDigits}`;
    // One insert per table, so TypeScript checks each row against its own columns.
    const { data, error } = kind === 'customer'
      ? await supabase.from('customers').insert({ full_name: name, phone, email: email || null, city, locality: locality || null, services, email_consent: emailConsent, whatsapp_consent: whatsappConsent, signup_ip_hash: ipHash }).select('id, waitlist_number').single()
      : await supabase.from('businesses').insert({ owner_name: name, phone, email: email || null, city, locality: locality || null, business_name: businessName, business_type: businessType, email_consent: emailConsent, whatsapp_consent: whatsappConsent, signup_ip_hash: ipHash }).select('id, waitlist_number').single();
    if (error) {
      if (error.code === '23505') return bad('This mobile number is already registered for this waitlist.', 409);
      console.error('Supabase registration error:', error);
      return bad('Could not save your registration. Please try again.', 500);
    }

    const prefix = kind === 'customer' ? 'UST-C' : 'UST-B';
    const id = `${prefix}-${String(data.waitlist_number).padStart(6, '0')}`;
    // Notifications are deliberately best-effort: registration remains successful if a provider is not configured.
    const notificationResults = await Promise.allSettled([
      emailConsent && email ? sendEmail({ kind, name, email, id, position: data.waitlist_number, city }) : Promise.resolve('email_skipped'),
      whatsappConsent ? sendWhatsApp({ kind, name, to: phoneDigits, id, position: data.waitlist_number, city }) : Promise.resolve('whatsapp_skipped')
    ]);
    await supabase.from('notification_logs').insert(notificationResults.map((result, index) => ({ registration_kind: kind, registration_id: data.id, channel: index === 0 ? 'email' : 'whatsapp', status: result.status === 'fulfilled' ? String(result.value).startsWith('sent') ? 'sent' : 'skipped' : 'failed', error_message: result.status === 'rejected' ? String(result.reason).slice(0, 500) : null })));
    return NextResponse.json({ ok: true, id, position: data.waitlist_number });
  } catch (error) {
    console.error(error);
    return bad('Invalid request. Please try again.');
  }
}

async function sendEmail({ kind, name, email, id, position, city }: { kind: string; name: string; email: string; id: string; position: number; city: string }) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return 'email_skipped';
  const subject = kind === 'customer' ? 'Welcome to USTRA — you are on the waitlist!' : 'Welcome to USTRA Business Club — registration received!';
  const html = `<div style="background:#090909;color:#f7f2e8;padding:36px;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;border:1px solid #b98728;padding:32px"><div style="color:#eeb52f;font-size:13px;letter-spacing:4px">USTRA · YOUR STYLE. OUR PRIORITY.</div><h1 style="font-size:30px">Welcome, ${escapeHtml(name)}.</h1><p>Your ${kind} waitlist registration is successful. We are glad to have you with us.</p><div style="background:#171717;padding:20px;margin:24px 0"><p style="color:#d7a52e">YOUR WAITLIST DETAILS</p><p><b>ID:</b> ${id}</p><p><b>Position:</b> #${position}</p><p><b>City:</b> ${escapeHtml(city)}</p><p><b>Status:</b> Registered</p></div><p>We will keep you updated as USTRA gets ready to launch.</p><p style="color:#d7a52e">Your Style. Our Priority.<br/>Team USTRA</p></div></div>`;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [email], subject, html }) });
  if (!response.ok) throw new Error(`Resend error: ${await response.text()}`);
  return 'sent_email';
}

async function sendWhatsApp({ kind, name, to, id, position, city }: { kind: string; name: string; to: string; id: string; position: number; city: string }) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const numberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const template = kind === 'customer' ? process.env.WHATSAPP_TEMPLATE_CUSTOMER : process.env.WHATSAPP_TEMPLATE_BUSINESS;
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en';
  if (!token || !numberId || !template) return 'whatsapp_skipped';
  const response = await fetch(`https://graph.facebook.com/v21.0/${numberId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'template', template: { name: template, language: { code: language }, components: [{ type: 'body', parameters: [{ type: 'text', text: name }, { type: 'text', text: id }, { type: 'text', text: String(position) }, { type: 'text', text: city }] }] } }) });
  if (!response.ok) throw new Error(`WhatsApp API error: ${await response.text()}`);
  return 'sent_whatsapp';
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] || c)); }
