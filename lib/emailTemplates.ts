// Waitlist confirmation emails, in English and Hindi.
// Placeholders you can use in the subject and body:
//   {{Customer_Name}}, {{Waitlist_ID}}, {{Waitlist_Position}}, {{City}}

export type EmailKind = 'customer' | 'business';
export type EmailLanguage = 'en' | 'hi';

export type EmailValues = {
  Customer_Name: string;
  Waitlist_ID: string;
  Waitlist_Position: string;
  City: string;
};

type Copy = {
  subject: string;
  brand: string;
  greeting: string;
  intro: string;
  detailsTitle: string;
  labels: { id: string; position: string; city: string; status: string };
  statusValue: string;
  update: string;
  tagline: string;
  signature: string;
};

const COPY: Record<EmailLanguage, Record<EmailKind, Copy>> = {
  en: {
    customer: {
      subject: 'Welcome to USTRA, {{Customer_Name}}. You are on the waitlist!',
      brand: 'USTRA · YOUR STYLE. OUR PRIORITY.',
      greeting: 'Welcome, {{Customer_Name}}.',
      intro: 'Your customer waitlist registration is successful. We are glad to have you with us.',
      detailsTitle: 'YOUR WAITLIST DETAILS',
      labels: { id: 'ID', position: 'Position', city: 'City', status: 'Status' },
      statusValue: 'Registered',
      update: 'We will keep you updated as USTRA gets ready to launch in your city.',
      tagline: 'Your Style. Our Priority.',
      signature: 'Team USTRA',
    },
    business: {
      subject: 'Welcome to USTRA Business Club, {{Customer_Name}}. Registration received!',
      brand: 'USTRA · YOUR STYLE. OUR PRIORITY.',
      greeting: 'Welcome, {{Customer_Name}}.',
      intro: 'Your business waitlist registration is successful. We are glad to have you with us.',
      detailsTitle: 'YOUR WAITLIST DETAILS',
      labels: { id: 'ID', position: 'Position', city: 'City', status: 'Status' },
      statusValue: 'Registered',
      update: 'We will keep you updated as USTRA gets ready to launch in your city.',
      tagline: 'Your Style. Our Priority.',
      signature: 'Team USTRA',
    },
  },
  hi: {
    customer: {
      subject: 'USTRA में स्वागत है, {{Customer_Name}}। आप वेटलिस्ट में शामिल हो गए हैं!',
      brand: 'USTRA · आपका स्टाइल। हमारी प्राथमिकता।',
      greeting: 'नमस्ते, {{Customer_Name}}।',
      intro: 'आपका ग्राहक वेटलिस्ट रजिस्ट्रेशन सफल हो गया है। आपको हमारे साथ देखकर हमें खुशी है।',
      detailsTitle: 'आपकी वेटलिस्ट जानकारी',
      labels: { id: 'ID', position: 'स्थिति', city: 'शहर', status: 'स्टेटस' },
      statusValue: 'रजिस्टर हो गया',
      update: 'USTRA आपके शहर में लॉन्च की तैयारी कर रहा है। हम आपको हर अपडेट देते रहेंगे।',
      tagline: 'आपका स्टाइल। हमारी प्राथमिकता।',
      signature: 'टीम USTRA',
    },
    business: {
      subject: 'USTRA बिज़नेस क्लब में स्वागत है, {{Customer_Name}}। रजिस्ट्रेशन प्राप्त हुआ!',
      brand: 'USTRA · आपका स्टाइल। हमारी प्राथमिकता।',
      greeting: 'नमस्ते, {{Customer_Name}}।',
      intro: 'आपका बिज़नेस वेटलिस्ट रजिस्ट्रेशन सफल हो गया है। आपको हमारे साथ देखकर हमें खुशी है।',
      detailsTitle: 'आपकी वेटलिस्ट जानकारी',
      labels: { id: 'ID', position: 'स्थिति', city: 'शहर', status: 'स्टेटस' },
      statusValue: 'रजिस्टर हो गया',
      update: 'USTRA आपके शहर में लॉन्च की तैयारी कर रहा है। हम आपको हर अपडेट देते रहेंगे।',
      tagline: 'आपका स्टाइल। हमारी प्राथमिकता।',
      signature: 'टीम USTRA',
    },
  },
};

// Anything other than 'hi' falls back to English.
export function normalizeLanguage(value: unknown): EmailLanguage {
  return value === 'hi' ? 'hi' : 'en';
}

function buildBody(c: Copy, language: EmailLanguage): string {
  const font = language === 'hi' ? "'Noto Sans Devanagari',Arial,sans-serif" : 'Arial,sans-serif';
  return (
    `<div style="background:#090909;color:#f7f2e8;padding:36px;font-family:${font}">` +
    `<div style="max-width:560px;margin:auto;border:1px solid #b98728;padding:32px">` +
    `<div style="color:#eeb52f;font-size:13px;letter-spacing:4px">${c.brand}</div>` +
    `<h1 style="font-size:30px;margin:20px 0 8px">${c.greeting}</h1>` +
    `<p>${c.intro}</p>` +
    `<div style="background:#171717;padding:20px;margin:24px 0">` +
    `<p style="color:#d7a52e;margin:0 0 12px">${c.detailsTitle}</p>` +
    `<p><b>${c.labels.id}:</b> {{Waitlist_ID}}</p>` +
    `<p><b>${c.labels.position}:</b> #{{Waitlist_Position}}</p>` +
    `<p><b>${c.labels.city}:</b> {{City}}</p>` +
    `<p><b>${c.labels.status}:</b> ${c.statusValue}</p>` +
    `</div>` +
    `<p>${c.update}</p>` +
    `<p style="color:#d7a52e">${c.tagline}<br/>${c.signature}</p>` +
    `</div></div>`
  );
}

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

export function renderEmail(
  kind: EmailKind,
  values: EmailValues,
  language: EmailLanguage = 'en',
): { subject: string; html: string } {
  const copy = COPY[language][kind];
  return {
    subject: fill(copy.subject, values, false),
    html: fill(buildBody(copy, language), values, true),
  };
}
