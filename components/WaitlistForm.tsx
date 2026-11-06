'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, LoaderCircle } from 'lucide-react';
import { getVisitorId, trackStep } from '@/lib/tracking';

type Kind = 'customer' | 'business';

export default function WaitlistForm({ kind, onClose }: { kind: Kind; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; position: number } | null>(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', locality: '', businessName: '', businessType: 'Barber Shop', services: [] as string[], whatsappConsent: false, emailConsent: false, emailLanguage: 'en' });
  const isBusiness = kind === 'business';
  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));
  const toggleService = (s: string) => setForm((p) => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/waitlist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, kind, visitorId: getVisitorId() }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration could not be completed.');
      setDone({ id: data.id, position: data.position });
      trackStep('submit', kind);
    } catch (err) { setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }

  if (done) return <div className="success-panel"><div className="success-icon"><CheckCircle2 size={42}/></div><p className="eyebrow">YOU&apos;RE ON THE LIST</p><h2>Welcome to the <em>USTRA</em> family.</h2><p>Your {isBusiness ? 'business' : 'customer'} registration has been received.</p><div className="ticket"><span>YOUR WAITLIST ID</span><strong>{done.id}</strong><span>Registration position</span><strong>#{done.position}</strong></div><p className="muted small">We&apos;ll send your confirmation to your email and WhatsApp, where delivery is enabled.</p><button className="button button-gold full" onClick={onClose}>BACK TO USTRA</button></div>;

  return <form className="waitlist-form" onSubmit={submit}>
    <div className="form-heading"><p className="eyebrow">{isBusiness ? 'USTRA BUSINESS CLUB' : 'THE INNER CIRCLE'}</p><h2>{isBusiness ? 'Put your business' : 'Get early access'} <em>{isBusiness ? 'in the spotlight.' : 'to better grooming.'}</em></h2><p className="muted">{isBusiness ? 'Join the network. Meet more local customers. Grow with USTRA.' : 'Be among the first to discover and book trusted grooming professionals near you.'}</p></div>
    <div className="field-grid"><label>Full name *<input required value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your full name" autoComplete="name"/></label><label>Mobile number *<input required type="tel" pattern="[+0-9 ()-]{8,18}" value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="+91 98765 43210" autoComplete="tel"/></label><label className="span-two">Email address<input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com" autoComplete="email"/></label>
    {isBusiness && <><label className="span-two">Business / salon name *<input required value={form.businessName} onChange={e=>update('businessName',e.target.value)} placeholder="Your business name"/></label><label>Business type<select value={form.businessType} onChange={e=>update('businessType',e.target.value)}><option>Barber Shop</option><option>Premium Salon</option><option>Unisex Salon</option><option>Grooming Studio</option><option>Independent Barber</option></select></label></>}
    <label>City *<input required value={form.city} onChange={e=>update('city',e.target.value)} placeholder="Your city"/></label><label>Area / locality<input value={form.locality} onChange={e=>update('locality',e.target.value)} placeholder="Neighbourhood"/></label></div>
    {!isBusiness && <div className="service-picker"><p className="label-title">What grooming services interest you?</p><div className="chips">{['Haircut','Beard styling','Shaving','Facial','Hair spa','Massage'].map(s=><button type="button" key={s} className={`chip ${form.services.includes(s)?'selected':''}`} onClick={()=>toggleService(s)}>{s}</button>)}</div></div>}
    <div className="field-grid"><label className="span-two">Email language<select value={form.emailLanguage} onChange={e=>update('emailLanguage',e.target.value)}><option value="en">English</option><option value="hi">Hindi</option></select></label></div>
    <div className="consents"><label><input type="checkbox" checked={form.emailConsent} onChange={e=>update('emailConsent',e.target.checked)}/> I agree to receive my registration confirmation and important updates by email.</label><label><input type="checkbox" checked={form.whatsappConsent} onChange={e=>update('whatsappConsent',e.target.checked)}/> I agree to receive my registration confirmation and important updates on WhatsApp.</label></div>
    <p className="muted small">We also link the pages you view and the videos you watch in this browser with the details you submit here, to understand how people find USTRA.</p>
    {error && <p className="error">{error}</p>}
    <button className="button button-gold full" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={18}/> Joining...</> : <>JOIN THE WAITLIST <ArrowRight size={18}/></>}</button>
    <p className="form-foot">No payment required. Your details stay protected.</p>
  </form>;
}
