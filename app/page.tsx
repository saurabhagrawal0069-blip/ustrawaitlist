'use client';

import { useEffect, useState } from 'react';
import { ArrowDown, ArrowRight, Crown, MapPin, Scissors, ShieldCheck, Sparkles, Store, X } from 'lucide-react';
import WaitlistForm from '@/components/WaitlistForm';
import OfferBanner from '@/components/OfferBanner';
import BookingAnimation from '@/components/BookingAnimation';
import PromoVideo from '@/components/PromoVideo';
import { LanguageProvider, useLanguage } from '@/lib/i18n';
import { trackStep } from '@/lib/tracking';

export default function Home() {
  return (
    <LanguageProvider>
      <Landing />
    </LanguageProvider>
  );
}

const switchButtonStyle = { padding: '8px 12px', minHeight: 0, fontSize: 12, letterSpacing: '0.08em' };

// Two buttons, one per language. The chosen language is remembered in this browser.
function LanguageSwitch() {
  const { lang, setLang, t } = useLanguage();
  return (
    <div role="group" aria-label={t('lang.label')} style={{ display: 'inline-flex', gap: 6 }}>
      <button type="button" aria-pressed={lang === 'en'} className={`button ${lang === 'en' ? 'button-gold' : 'button-outline'}`} style={switchButtonStyle} onClick={() => setLang('en')}>{t('lang.en')}</button>
      <button type="button" aria-pressed={lang === 'hi'} className={`button ${lang === 'hi' ? 'button-gold' : 'button-outline'}`} style={switchButtonStyle} onClick={() => setLang('hi')}>{t('lang.hi')}</button>
    </div>
  );
}

function Landing() {
  const { t } = useLanguage();
  const [kind, setKind] = useState<'customer'|'business'|null>(null);
  useEffect(() => { trackStep('view'); }, []);
  useEffect(() => { if (kind) trackStep('join', kind); }, [kind]);
  const tickerWords = t('ticker').split('|');
  const year = new Date().getFullYear();

  return <main>
    <nav className="nav wrap"><a className="brand" href="#home"><span className="brand-mark"><Crown size={22}/></span><span>USTRA<small>{t('brand.tagline')}</small></span></a><div className="nav-links"><a href="#why">{t('nav.why')}</a><a href="#how">{t('nav.how')}</a><a href="#business">{t('nav.business')}</a></div><LanguageSwitch /><button className="button button-outline nav-cta" onClick={()=>setKind('customer')}>{t('nav.join')} <ArrowRight size={15}/></button></nav>
    <section className="hero" id="home"><div className="hero-lines"/><div className="hero-content wrap"><div className="hero-copy"><p className="eyebrow"><span className="live-dot"/> {t('hero.eyebrow')}</p><h1>{t('hero.line1')}<br/><em>{t('hero.line2')}</em><br/>{t('hero.line3')}</h1><p className="hero-sub">{t('hero.sub')}</p><div className="hero-actions"><button className="button button-gold" onClick={()=>setKind('customer')}>{t('hero.customer')} <ArrowRight size={18}/></button><button className="button button-outline" onClick={()=>setKind('business')}>{t('hero.business')} <Store size={17}/></button></div><div className="hero-proof"><span><ShieldCheck size={16}/> {t('hero.proof.access')}</span><span><Sparkles size={16}/> {t('hero.proof.privileges')}</span><span><MapPin size={16}/> {t('hero.proof.local')}</span></div></div><div className="hero-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-card"><div className="art-crown"><Crown size={48}/></div><div className="art-beard">✦</div><div className="art-word">USTRA</div><div className="art-rule"/><p>{t('art.line1')}<br/>{t('art.line2')}</p><span>{t('art.tagline')}</span></div><div className="floating-tag tag-top"><Scissors size={15}/> {t('art.tagTop')}</div><div className="floating-tag tag-bottom"><span className="live-dot"/> {t('art.tagBottom')}</div></div></div><a href="#why" className="scroll-cue"><ArrowDown size={16}/> {t('hero.scroll')}</a></section>
    <section className="section wrap" id="promo"><div className="section-intro centered" style={{textAlign:'center',margin:'0 auto 44px'}}><p className="eyebrow">{t('promo.eyebrow')}</p><h2>{t('promo.title1')} <em>{t('promo.title2')}</em></h2></div><div className="promo-pair"><PromoVideo src="/promo.mp4" videoKey="narrated" /><PromoVideo src="/ustra-promo-9x16.mp4" videoKey="short" /></div></section>
    <OfferBanner onJoin={setKind}/>
    <BookingAnimation onJoin={() => setKind('customer')}/>
    <section className="ticker"><div>{[...tickerWords, ...tickerWords].map((word, i) => <span key={i}>{word} <i>✦</i> </span>)}</div></section>
    <section className="section wrap" id="why"><div className="section-intro"><p className="eyebrow">{t('why.eyebrow')}</p><h2>{t('why.title1')}<br/>{t('why.title2')} <em>{t('why.em')}</em></h2><p className="muted">{t('why.body')}</p></div><div className="feature-grid"><article className="feature-card"><div className="feature-icon"><MapPin/></div><h3>{t('feature.1.title')}</h3><p>{t('feature.1.text')}</p><span>{t('feature.1.tag')}</span></article><article className="feature-card"><div className="feature-icon"><Scissors/></div><h3>{t('feature.2.title')}</h3><p>{t('feature.2.text')}</p><span>{t('feature.2.tag')}</span></article><article className="feature-card"><div className="feature-icon"><Sparkles/></div><h3>{t('feature.3.title')}</h3><p>{t('feature.3.text')}</p><span>{t('feature.3.tag')}</span></article></div></section>
    <section className="business-band" id="business"><div className="wrap business-inner"><div><p className="eyebrow">{t('biz.eyebrow')}</p><h2>{t('biz.title1')}<br/><em>{t('biz.title2')}</em></h2><p className="muted">{t('biz.body')}</p><ul><li>{t('biz.point.1')}</li><li>{t('biz.point.2')}</li><li>{t('biz.point.3')}</li></ul><button className="button button-gold" onClick={()=>setKind('business')}>{t('hero.business')} <ArrowRight size={18}/></button></div><div className="business-stamp"><Crown size={46}/><strong>USTRA</strong><span>{t('biz.stamp1')}<br/>{t('biz.stamp2')}</span><i>✦</i></div></div></section>
    <section className="section wrap how-section" id="how"><div className="section-intro centered"><p className="eyebrow">{t('how.eyebrow')}</p><h2>{t('how.title1')} <em>{t('how.title2')}</em></h2></div><div className="steps"><div><b>01</b><h3>{t('step.1.title')}</h3><p>{t('step.1.text')}</p></div><div><b>02</b><h3>{t('step.2.title')}</h3><p>{t('step.2.text')}</p></div><div><b>03</b><h3>{t('step.3.title')}</h3><p>{t('step.3.text')}</p></div></div><div className="final-cta"><p className="eyebrow">{t('final.eyebrow')}</p><h2>{t('final.title1')} <em>{t('final.title2')}</em></h2><button className="button button-gold" onClick={()=>setKind('customer')}>{t('final.cta')} <ArrowRight size={18}/></button></div></section>
    <footer className="footer"><div className="wrap footer-inner"><a className="brand" href="#home"><span className="brand-mark"><Crown size={22}/></span><span>USTRA<small>{t('brand.tagline')}</small></span></a><p>{t('footer.copy', { year })}</p><span>{t('footer.tagline')}</span></div></footer>
    {kind && <div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setKind(null)}}><div className="modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={()=>setKind(null)} aria-label="Close"><X/></button><WaitlistForm kind={kind} onClose={()=>setKind(null)}/></div></div>}
  </main>;
}
