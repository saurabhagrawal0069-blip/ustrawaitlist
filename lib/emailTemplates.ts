// Waitlist confirmation emails.
// Placeholders you can use in the subject and body:
//   {{Customer_Name}}, {{Waitlist_ID}}, {{Waitlist_Position}}, {{City}}

export type EmailKind = 'customer' | 'business';

export type EmailValues = {
  Customer_Name: string;
  Waitlist_ID: string;
  Waitlist_Position: string;
  City: string;
};

const SUBJECTS: Record<EmailKind, string> = {
  customer: 'Welcome to USTRA, {{Customer_Name}}. You are on the waitlist!',
  business: 'Welcome to USTRA Business Club, {{Customer_Name}}. Registration received!',
};

const BODIES: Record<EmailKind, string> = {
  customer:
    '<div style="background:#090909;color:#f7f2e8;padding:36px;font-family:Arial,sans-serif">' +
    '<div style="max-width:560px;margin:auto;border:1px solid #b98728;padding:32px">' +
    '<div style="color:#eeb52f;font-size:13px;letter-spacing:4px">USTRA · YOUR STYLE. OUR PRIORITY.</div>' +
    '<h1 style="font-size:30px;margin:20px 0 8px">Welcome, {{Customer_Name}}.</h1>' +
    '<p>Your customer waitlist registration is successful. We are glad to have you with us.</p>' +
    '<div style="background:#171717;padding:20px;margin:24px 0">' +
    '<p style="color:#d7a52e;margin:0 0 12px">YOUR WAITLIST DETAILS</p>' +
    '<p><b>ID:</b> {{Waitlist_ID}}</p>' +
    '<p><b>Position:</b> #{{Waitlist_Position}}</p>' +
    '<p><b>City:</b> {{City}}</p>' +
    '<p><b>Status:</b> Registered</p>' +
    '</div>' +
    '<p>We will keep you updated as USTRA gets ready to launch in your city.</p>' +
    '<p style="color:#d7a52e">Your Style. Our Priority.<br/>Team USTRA</p>' +
    '</div></div>',
  business:
    '<div style="background:#090909;color:#f7f2e8;padding:36px;font-family:Arial,sans-serif">' +
    '<div style="max-width:560px;margin:auto;border:1px solid #b98728;padding:32px">' +
    '<div style="color:#eeb52f;font-size:13px;letter-spacing:4px">USTRA · YOUR STYLE. OUR PRIORITY.</div>' +
    '<h1 style="font-size:30px;margin:20px 0 8px">Welcome, {{Customer_Name}}.</h1>' +
    '<p>Your business waitlist registration is successful. We are glad to have you with us.</p>' +
    '<div style="background:#171717;padding:20px;margin:24px 0">' +
    '<p style="color:#d7a52e;margin:0 0 12px">YOUR WAITLIST DETAILS</p>' +
    '<p><b>ID:</b> {{Waitlist_ID}}</p>' +
    '<p><b>Position:</b> #{{Waitlist_Position}}</p>' +
    '<p><b>City:</b> {{City}}</p>' +
    '<p><b>Status:</b> Registered</p>' +
    '</div>' +
    '<p>We will keep you updated as USTRA gets ready to launch in your city.</p>' +
    '<p style="color:#d7a52e">Your Style. Our Priority.<br/>Team USTRA</p>' +
    '</div></div>',
};

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// Replaces {{Placeholder}} with the value. HTML output escapes the value; the subject does not.
function fill(template: string, values: EmailValues, asHtml: boolean): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: keyof EmailValues) => {
    const value = values[key] ?? '';
    return asHtml ? escapeHtml(value) : value;
  });
}

export function renderEmail(kind: EmailKind, values: EmailValues): { subject: string; html: string } {
  return {
    subject: fill(SUBJECTS[kind], values, false),
    html: fill(BODIES[kind], values, true),
  };
}
