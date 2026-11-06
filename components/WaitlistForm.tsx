'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { getVisitorId, trackStep } from '@/lib/tracking';
import { useLanguage } from '@/lib/i18n';
import { SERVER_ERROR_KEYS, type MessageKey } from '@/lib/messages';

type Kind = 'customer' | 'business';

// Option values are sent to the server in English. Only the labels change with the language.
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

export default function WaitlistForm({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const { t, lang } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; position: number } | null>(null);
  const [error, setError] = useState('');
  // The email language starts as the page language, and the visitor can still change it.
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', locality: '', businessName: '', businessType: 'Barber Shop', services: [] as string[], whatsappConsent: false, emailConsent: false, emailLanguage: lang as string });
  const isBusiness = kind === 'business';
  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));
  const toggleService = (s: string) => setForm((p) => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, kind, visitorId: getVisitorId() }) });
      const data = await response.json();
      if (!response.ok) {
        const key = SERVER_ERROR_KEYS[data.error];
        throw new Error(key ? t(key) : data.error || t('form.error.failed'));
      }
      setDone({ id: data.id, position: data.position });
      trackStep('submit', kind);
    } catch (err) { setError(err instanceof Error ? err.message : t('form.error.generic')); }
    finally { setBusy(false); }
  }

  if (done) return <div className="success-panel"><div className="success-icon"><CheckCircle2 size={42}/></div><p className="eyebrow">{t('success.eyebrow')}</p><h2>{t('success.title1')} <em>{t('success.title2')}</em></h2><p>{isBusiness ? t('success.business') : t('success.customer')}</p><div className="ticket"><span>{t('success.id')}</span><strong>{done.id}</strong><span>{t('success.position')}</span><strong>#{done.position}</strong></div><p className="muted small">{t('success.note')}</p><button className="button button-gold full" onClick={onClose}>{t('success.back')}</button></div>;

  return <form className="waitlist-form" onSubmit={submit}>
    <div className="form-heading"><p className="eyebrow">{isBusiness ? t('form.business.club') : t('form.customer.club')}</p><h2>{isBusiness ? t('form.business.title') : t('form.customer.title')} <em>{isBusiness ? t('form.business.em') : t('form.customer.em')}</em></h2><p className="muted">{isBusiness ? t('form.business.sub') : t('form.customer.sub')}</p></div>
    <div className="field-grid"><label>{t('form.name')}<input required value={form.name} onChange={e=>update('name',e.target.value)} placeholder={t('form.name.ph')} autoComplete="name"/></label><label>{t('form.phone')}<input required type="tel" pattern="[+0-9 ()-]{8,18}" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91 98765 43210" autoComplete="tel"/></label><label className="span-two">{t('form.email')}<input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder={t('form.email.ph')} autoComplete="email"/></label>
    {isBusiness && <><label className="span-two">{t('form.biz.name')}<input required value={form.businessName} onChange={e=>update('businessName',e.target.value)} placeholder={t('form.biz.name.ph')}/></label><label>{t('form.biz.type')}<select value={form.businessType} onChange={e=>update('businessType',e.target.value)}>{BUSINESS_TYPES.map(([value, key]) => <option key={value} value={value}>{t(key)}</option>)}</select></label></>}
    <label>{t('form.city')}<input required value={form.city} onChange={e=>update('city',e.target.value)} placeholder={t('form.city.ph')}/></label><label>{t('form.locality')}<input value={form.locality} onChange={e=>update('locality',e.target.value)} placeholder={t('form.locality.ph')}/></label></div>
    {!isBusiness && <div className="service-picker"><p className="label-title">{t('form.services.q')}</p><div className="chips">{SERVICES.map(([value, key]) => <button type="button" key={value} className={`chip ${form.services.includes(value)?'selected':''}`} onClick={()=>toggleService(value)}>{t(key)}</button>)}</div></div>}
    <div className="field-grid"><label className="span-two">{t('form.lang')}<select value={form.emailLanguage} onChange={e=>update('emailLanguage',e.target.value)}><option value="en">{t('lang.en')}</option><option value="hi">{t('lang.hi')}</option></select></label></div>
    <div className="consents"><label><input type="checkbox" checked={form.emailConsent} onChange={e=>update('emailConsent',e.target.checked)}/> {t('form.consent.email')}</label><label><input type="checkbox" checked={form.whatsappConsent} onChange={e=>update('whatsappConsent',e.target.checked)}/> {t('form.consent.wa')}</label></div>
    <p className="muted small">{t('form.notice')}</p>
    {error && <p className="error">{error}</p>}
    <button className="button button-gold full" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={18}/> {t('form.submitting')}</> : <>{t('form.submit')} <ArrowRight size={18}/></>}</button>
    <p className="form-foot">{t('form.foot')}</p>
  </form>;
}
