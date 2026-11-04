# USTRA Waitlist — Starter Build

Premium black-and-gold responsive waitlist for customers and barber/salon businesses.

## Included
- Landing page with customer and business entry points
- Responsive customer and business registration forms
- Customer service preferences and separate email/WhatsApp consent
- Supabase-backed registration API with separate customer/business IDs
- Best-effort Resend email and Meta WhatsApp Cloud API notifications
- Notification delivery logs
- Supabase SQL schema for customers, businesses, notification logs and referral records

## Important current scope
This is the first working foundation, not a fully deployed production service. The public landing page and forms are implemented. Live registration requires Supabase credentials and running the SQL schema. Email and WhatsApp delivery require verified provider accounts, approved WhatsApp templates, valid opt-in, and environment variables. Admin dashboard, referral UI, login, and secure admin operations are the next build phase; the schema reserves referral and notification tables.

## Run locally
1. Install Node.js 20 or later.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase values.
4. In Supabase SQL Editor, run `supabase/schema.sql`.
5. Run `npm run dev` and open `http://localhost:3000`.

## Environment variables
See `.env.example`. Never put `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, or WhatsApp access tokens in client-side code or expose them with a `NEXT_PUBLIC_` prefix.

## Registration rules
Mobile numbers are stored with their country code. A 10-digit number is treated as Indian (+91), and each number can register only once per waitlist. Email and WhatsApp consent boxes are unchecked by default, so people must opt in themselves.

## WhatsApp template setup
Create and get approval for two WhatsApp Business Platform templates (one for customers and one for businesses). Set their names in `WHATSAPP_TEMPLATE_CUSTOMER` and `WHATSAPP_TEMPLATE_BUSINESS`, and their language code in `WHATSAPP_TEMPLATE_LANGUAGE` (default `en`). The API route sends four body parameters in this order: name, waitlist ID, position, city. No code changes are needed if your approved templates use these settings.

## Deploy
Deploy the Next.js project to Vercel or another Node.js host, add the same environment variables to the host, and connect your domain. Test with your own numbers and addresses before opening public registrations.
