'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Gift, type LucideIcon, Scissors, Store } from 'lucide-react';
import { Bi, pair } from '@/lib/i18n';
import type { MessageKey } from '@/lib/messages';

type Kind = 'customer' | 'business';

const SLIDES: { id: number; eyebrow: MessageKey; title: MessageKey; sub: MessageKey; cta: MessageKey; kind: Kind; icon: LucideIcon }[] = [
  { id: 1, eyebrow: 'offer.1.eyebrow', title: 'offer.1.title', sub: 'offer.1.sub', cta: 'offer.1.cta', kind: 'customer', icon: Gift },
  { id: 2, eyebrow: 'offer.2.eyebrow', title: 'offer.2.title', sub: 'offer.2.sub', cta: 'offer.2.cta', kind: 'business', icon: Store },
  { id: 3, eyebrow: 'offer.3.eyebrow', title: 'offer.3.title', sub: 'offer.3.sub', cta: 'offer.3.cta', kind: 'customer', icon: Scissors },
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
      aria-label={pair('offer.aria')}
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
              key={s.id}
              className={`offer-slide${active ? ' is-active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={pair('offer.position', { n: i + 1, total: count })}
              aria-hidden={!active}
            >
              <div className="offer-icon"><Icon size={26} /></div>
              <div className="offer-text">
                <p className="eyebrow"><Bi k={s.eyebrow}/></p>
                <h3><Bi k={s.title}/></h3>
                <p className="offer-sub"><Bi k={s.sub}/></p>
              </div>
              <button type="button" className="button button-gold offer-cta" onClick={() => onJoin(s.kind)} tabIndex={active ? 0 : -1}>
                <Bi k={s.cta} inline/> <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="offer-dots">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={`offer-dot${i === index ? ' is-active' : ''}`}
            aria-label={pair('offer.show', { n: i + 1 })}
            aria-current={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
