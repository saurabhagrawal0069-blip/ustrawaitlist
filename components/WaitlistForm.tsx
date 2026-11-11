'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { getVisitorId, trackStep } from '@/lib/tracking';
import { Bi, pair } from '@/lib/i18n';
import { SERVER_ERROR_KEYS, type MessageKey } from '@/lib/messages';

type Kind = 'customer' | 'business';

// Option values are sent to the server in English. Only the labels show both languages.
const BUSINESS_TYPES: [string, MessageKey][] = [
  ['Barber Shop', 'biztype.barber'],
  ['Premium Salon', 'biztype.premium'],
  ['Unisex Salon', 'biztype.unisex'],
  ['Grooming Studio', 'biztype.studio'],
  ['Independent Barber', 'biztype.independent'],
];

const SERVICES: [string, MessageKey][] = [
  ['Haircut', 'svc.haircut'],
  ['Beard styling', 'svc.beard'],
  ['Shaving', 'svc.shaving'],
  ['Facial', 'svc.facial'],
  ['Hair spa', 'svc.spa'],
  ['Massage', 'svc.massage'],
];

// 'choose' is the one-link entry (?join): only the role picker shows until a role is picked.
type Choice = Kind | 'choose';

export default function WaitlistForm({ kind, onPick, onClose }: { kind: Choice; onPick?: (k: Kind) => void; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; position: number } | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', locality: '', businessName: '', businessType: 'Barber Shop', services: [] as string[], whatsappConsent: false, emailConsent: false, emailLanguage: 'en' });
  const role: Kind = kind === 'business' ? 'business' : 'customer';
  const isBusiness = role === 'business';
  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));
  const toggleService = (s: string) => setForm((p) => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, kind: role, visitorId: getVisitorId() }) });
      const data = await response.json();
      if (!response.ok) {
        const key = SERVER_ERROR_KEYS[data.error];
        throw new Error(key ? pair(key) : data.error || pair('form.error.failed'));
      }
      setDone({ id: data.id, position: data.position });
      trackStep('submit', role);
    } catch (err) { setError(err instanceof Error ? err.message : pair('form.error.generic')); }
    finally { setBusy(false); }
  }

  if (done) return <div className="success-panel"><div className="success-icon"><CheckCircle2 size={42}/></div><p className="eyebrow"><Bi k="success.eyebrow"/></p><h2><Bi k="success.title1"/> <em><Bi k="success.title2"/></em></h2><p><Bi k={isBusiness ? 'success.business' : 'success.customer'}/></p><div className="ticket"><span><Bi k="success.id" inline/></span><strong>{done.id}</strong><span><Bi k="success.position" inline/></span><strong>#{done.position}</strong></div><p className="muted small"><Bi k="success.note"/></p><button className="button button-gold full" onClick={onClose}><Bi k="success.back" inline/></button></div>;

  // The two role options sit at the top of the form, always. Picking one shows the fields for it.
  // Shown only where the parent passes onPick (the one-link page). /join has its own switch and passes none.
  const picker = onPick && <div className="role-picker" role="group" aria-label="Choose who you are">
    <button type="button" className={`role-option ${kind === 'customer' ? 'selected' : ''}`} aria-pressed={kind === 'customer'} onClick={() => onPick?.('customer')}>I AM A CUSTOMER</button>
    <button type="button" className={`role-option ${kind === 'business' ? 'selected' : ''}`} aria-pressed={kind === 'business'} onClick={() => onPick?.('business')}>I AM A BARBER / BUSINESS</button>
  </div>;

  if (kind === 'choose') return <div className="waitlist-form"><p className="eyebrow"><Bi k="nav.join"/></p>{picker}</div>;

  return <form className="waitlist-form" onSubmit={submit}>
    {picker}
    <div className="form-heading"><p className="eyebrow"><Bi k={isBusiness ? 'form.business.club' : 'form.customer.club'}/></p><h2><Bi k={isBusiness ? 'form.business.title' : 'form.customer.title'}/> <em><Bi k={isBusiness ? 'form.business.em' : 'form.customer.em'}/></em></h2><p className="muted"><Bi k={isBusiness ? 'form.business.sub' : 'form.customer.sub'}/></p></div>
    <div className="field-grid"><label><Bi k="form.name"/><input required value={form.name} onChange={e=>update('name',e.target.value)} placeholder={pair('form.name.ph')} autoComplete="name"/></label><label><Bi k="form.phone"/><input required type="tel" pattern="[+0-9 ()-]{8,18}" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91 98765 43210" autoComplete="tel"/></label><label className="span-two"><Bi k="form.email"/><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com" autoComplete="email"/></label>
    {isBusiness && <><label className="span-two"><Bi k="form.biz.name"/><input required value={form.businessName} onChange={e=>update('businessName',e.target.value)} placeholder={pair('form.biz.name.ph')}/></label><label><Bi k="form.biz.type"/><select value={form.businessType} onChange={e=>update('businessType',e.target.value)}>{BUSINESS_TYPES.map(([value, key]) => <option key={value} value={value}>{pair(key)}</option>)}</select></label></>}
    <label><Bi k="form.city"/><input required value={form.city} onChange={e=>update('city',e.target.value)} placeholder={pair('form.city.ph')}/></label><label><Bi k="form.locality"/><input value={form.locality} onChange={e=>update('locality',e.target.value)} placeholder={pair('form.locality.ph')}/></label></div>
    {!isBusiness && <div className="service-picker"><p className="label-title"><Bi k="form.services.q"/></p><div className="chips">{SERVICES.map(([value, key]) => <button type="button" key={value} className={`chip ${form.services.includes(value)?'selected':''}`} onClick={()=>toggleService(value)}><Bi k={key} inline/></button>)}</div></div>}
    <div className="field-grid"><label className="span-two"><Bi k="form.lang"/><select value={form.emailLanguage} onChange={e=>update('emailLanguage',e.target.value)}><option value="en">English</option><option value="hi">हिंदी</option></select></label></div>
    <div className="consents"><label><input type="checkbox" checked={form.emailConsent} onChange={e=>update('emailConsent',e.target.checked)}/> <Bi k="form.consent.email"/></label><label><input type="checkbox" checked={form.whatsappConsent} onChange={e=>update('whatsappConsent',e.target.checked)}/> <Bi k="form.consent.wa"/></label></div>
    <p className="muted small"><Bi k="form.notice"/></p>
    {error && <p className="error">{error}</p>}
    <button className="button button-gold full" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={18}/> <Bi k="form.submitting" inline/></> : <><Bi k="form.submit" inline/> <ArrowRight size={18}/></>}</button>
    <p className="form-foot"><Bi k="form.foot"/></p>
  </form>;
}
