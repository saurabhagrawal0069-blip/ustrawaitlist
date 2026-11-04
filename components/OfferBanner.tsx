'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Gift, type LucideIcon, Scissors, Store } from 'lucide-react';

type Kind = 'customer' | 'business';

const SLIDES: { eyebrow: string; title: string; sub: string; cta: string; kind: Kind; icon: LucideIcon }[] = [
  { eyebrow: 'EARLY ACCESS OFFER', title: 'Join first, get launch privileges', sub: 'Waitlist members hear about USTRA opening in their city before anyone else.', cta: 'JOIN AS CUSTOMER', kind: 'customer', icon: Gift },
  { eyebrow: 'FOR BARBERS & SALONS', title: 'Become a founding partner', sub: 'Get listed in the early partner network and reach local customers from day one.', cta: 'JOIN AS BUSINESS', kind: 'business', icon: Store },
  { eyebrow: 'BOOK SMARTER', title: 'Trusted grooming near you', sub: 'Haircut, beard, shave, facial and more, all in one place.', cta: 'CLAIM YOUR SPOT', kind: 'customer', icon: Scissors },
];

const INTERVAL_MS = 4000;
const SWIPE_MIN_PX = 40;

export default function OfferBanner({ onJoin }: { onJoin: (kind: Kind) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = SLIDES.length;

  // Auto-advance every few seconds. Pauses while the pointer or keyboard focus is on the banner,
  // and stays still for visitors who ask for reduced motion.
  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused, count]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) < SWIPE_MIN_PX) return;
    setIndex((i) => (dx < 0 ? (i + 1) % count : (i - 1 + count) % count));
  }

  return (
    <section
      className="offer-banner"
      aria-roledescription="carousel"
      aria-label="Waitlist offers"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="wrap offer-stage">
        {SLIDES.map((s, i) => {
          const Icon = s.icon;
          const active = i === index;
          return (
            <div
              key={s.title}
              className={`offer-slide${active ? ' is-active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
            >
              <div className="offer-icon"><Icon size={26} /></div>
              <div className="offer-text">
                <p className="eyebrow">{s.eyebrow}</p>
                <h3>{s.title}</h3>
                <p className="offer-sub">{s.sub}</p>
              </div>
              <button type="button" className="button button-gold offer-cta" onClick={() => onJoin(s.kind)} tabIndex={active ? 0 : -1}>
                {s.cta} <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="offer-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            className={`offer-dot${i === index ? ' is-active' : ''}`}
            aria-label={`Show offer ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
