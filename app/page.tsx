'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, Crown, MapPin, Scissors, ShieldCheck, Sparkles, Store, X } from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';
import OfferBanner from '@/components/OfferBanner';
import BookingAnimation from '@/components/BookingAnimation';
import PromoVideo from '@/components/PromoVideo';
import { Bi } from '@/lib/i18n';
import { messages } from '@/lib/messages';
import { trackStep } from '@/lib/tracking';

// Each ticker item shows the English word and its Hindi word together.
const TICKER_EN = messages.en.ticker.split('|');
const TICKER_HI = messages.hi.ticker.split('|');
const TICKER = TICKER_EN.map((word, i) => `${word} · ${TICKER_HI[i]}`);

export default function Home() {
  const [kind, setKind] = useState<'customer'|'business'|null>(null);
  useEffect(() => { trackStep('view'); }, []);
  useEffect(() => { if (kind) trackStep('join', kind); }, [kind]);
  const year = new Date().getFullYear();

  return <main>
    <nav className="nav wrap"><a className="brand" href="#home"><span className="brand-mark"><Crown size={22}/></span><span>USTRA<small><Bi k="brand.tagline"/></small></span></a><div className="nav-links"><a href="#why"><Bi k="nav.why" inline/></a><a href="#how"><Bi k="nav.how" inline/></a><a href="#business"><Bi k="nav.business" inline/></a></div><button className="button button-outline nav-cta" onClick={()=>setKind('customer')}><Bi k="nav.join" inline/> <ArrowRight size={15}/></button></nav>
    <section className="hero" id="home"><div className="hero-lines"/><div className="hero-content wrap"><div className="hero-copy"><p className="eyebrow"><span className="live-dot"/> <Bi k="hero.eyebrow"/></p><h1><Bi k="hero.line1"/><br/><em><Bi k="hero.line2"/></em><br/><Bi k="hero.line3"/></h1><p className="hero-sub"><Bi k="hero.sub"/></p><div className="hero-actions"><button className="button button-gold" onClick={()=>setKind('customer')}><Bi k="hero.customer" inline/> <ArrowRight size={18}/></button><button className="button button-outline" onClick={()=>setKind('business')}><Bi k="hero.business" inline/> <Store size={17}/></button></div><div className="hero-proof"><span><ShieldCheck size={16}/> <Bi k="hero.proof.access" inline/></span><span><Sparkles size={16}/> <Bi k="hero.proof.privileges" inline/></span><span><MapPin size={16}/> <Bi k="hero.proof.local" inline/></span></div></div><div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-card"><div className="art-crown"><Crown size={48}/></div><div className="art-beard">✦</div><div className="art-word">USTRA</div><div className="art-rule"/><p><Bi k="art.line1"/><br/><Bi k="art.line2"/></p><span><Bi k="art.tagline"/></span></div><div className="floating-tag tag-top"><Scissors size={15}/> <Bi k="art.tagTop" inline/></div><div className="floating-tag tag-bottom"><span className="live-dot"/> <Bi k="art.tagBottom" inline/></div></div></div><a href="#why" className="scroll-cue"><ArrowDown size={16}/> <Bi k="hero.scroll" inline/></a></section>
    <section className="section wrap" id="promo"><div className="section-intro centered" style={{textAlign:'center',margin:'0 auto 44px'}}><p className="eyebrow"><Bi k="promo.eyebrow"/></p><h2><Bi k="promo.title1"/> <em><Bi k="promo.title2"/></em></h2></div><div className="promo-pair"><PromoVideo src="/promo.mp4" videoKey="narrated" /><PromoVideo src="/ustra-promo-9x16.mp4" videoKey="short" /></div></section>
    <OfferBanner onJoin={setKind}/>
    <BookingAnimation onJoin={() => setKind('customer')}/>
    <section className="ticker"><div>{[...TICKER, ...TICKER].map((word, i) => <span key={i}>{word} <i>✦</i> </span>)}</div></section>
    <section className="section wrap" id="why"><div className="section-intro"><p className="eyebrow"><Bi k="why.eyebrow"/></p><h2><Bi k="why.title1"/><br/><Bi k="why.title2"/> <em><Bi k="why.em"/></em></h2><p className="muted"><Bi k="why.body"/></p></div><div className="feature-grid"><article className="feature-card"><div className="feature-icon"><MapPin/></div><h3><Bi k="feature.1.title"/></h3><p><Bi k="feature.1.text"/></p><span><Bi k="feature.1.tag"/></span></article><article className="feature-card"><div className="feature-icon"><Scissors/></div><h3><Bi k="feature.2.title"/></h3><p><Bi k="feature.2.text"/></p><span><Bi k="feature.2.tag"/></span></article><article className="feature-card"><div className="feature-icon"><Sparkles/></div><h3><Bi k="feature.3.title"/></h3><p><Bi k="feature.3.text"/></p><span><Bi k="feature.3.tag"/></span></article></div></section>
    <section className="business-band" id="business"><div className="wrap business-inner"><div><p className="eyebrow"><Bi k="biz.eyebrow"/></p><h2><Bi k="biz.title1"/><br/><em><Bi k="biz.title2"/></em></h2><p className="muted"><Bi k="biz.body"/></p><ul><li><Bi k="biz.point.1"/></li><li><Bi k="biz.point.2"/></li><li><Bi k="biz.point.3"/></li></ul><button className="button button-gold" onClick={()=>setKind('business')}><Bi k="hero.business" inline/> <ArrowRight size={18}/></button></div><div className="business-stamp"><Crown size={46}/><strong>USTRA</strong><span><Bi k="biz.stamp1"/><br/><Bi k="biz.stamp2"/></span><i>✦</i></div></div></section>
    <section className="section wrap how-section" id="how"><div className="section-intro centered"><p className="eyebrow"><Bi k="how.eyebrow"/></p><h2><Bi k="how.title1"/> <em><Bi k="how.title2"/></em></h2></div><div className="steps"><div><b>01</b><h3><Bi k="step.1.title"/></h3><p><Bi k="step.1.text"/></p></div><div><b>02</b><h3><Bi k="step.2.title"/></h3><p><Bi k="step.2.text"/></p></div><div><b>03</b><h3><Bi k="step.3.title"/></h3><p><Bi k="step.3.text"/></p></div></div><div className="final-cta"><p className="eyebrow"><Bi k="final.eyebrow"/></p><h2><Bi k="final.title1"/> <em><Bi k="final.title2"/></em></h2><button className="button button-gold" onClick={()=>setKind('customer')}><Bi k="final.cta" inline/> <ArrowRight size={18}/></button></div></section>
    <footer className="footer"><div className="wrap footer-inner"><a className="brand" href="#home"><span className="brand-mark"><Crown size={22}/></span><span>USTRA<small><Bi k="brand.tagline"/></small></span></a><p><Bi k="footer.copy" params={{ year }}/></p><span><Bi k="footer.tagline"/></span></div></footer>
    {kind && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setKind(null)}}><div className="modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={()=>setKind(null)} aria-label="Close"><X/></button><WaitlistForm kind={kind} onClose={()=>setKind(null)}/></div></div>}
  </main>;
}
