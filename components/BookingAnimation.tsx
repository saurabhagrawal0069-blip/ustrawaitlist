'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Check, Clock3, MapPin, Scissors, Store, Volume2, VolumeX, type LucideIcon } from 'lucide-react';
import { Bi, pair } from '@/lib/i18n';
import { messages, type MessageKey } from '@/lib/messages';

type Scene = {
  icon: LucideIcon;
  step: MessageKey;
  title: MessageKey;
  copy: MessageKey;
  voice: MessageKey;
  tag: MessageKey;
  heading: MessageKey;
  shop1: MessageKey;
  shop1sub: MessageKey;
  shop2: MessageKey;
  shop2sub: MessageKey;
  confirm: MessageKey;
};

const SCENES: Scene[] = [
  { icon: MapPin, step: 's1.step', title: 's1.title', copy: 's1.copy', voice: 's1.voice', tag: 's1.tag', heading: 's1.heading', shop1: 's1.shop1', shop1sub: 's1.shop1sub', shop2: 's1.shop2', shop2sub: 's1.shop2sub', confirm: 's1.confirm' },
  { icon: CalendarCheck, step: 's2.step', title: 's2.title', copy: 's2.copy', voice: 's2.voice', tag: 's2.tag', heading: 's2.heading', shop1: 's2.shop1', shop1sub: 's2.shop1sub', shop2: 's2.shop2', shop2sub: 's2.shop2sub', confirm: 's2.confirm' },
  { icon: Check, step: 's3.step', title: 's3.title', copy: 's3.copy', voice: 's3.voice', tag: 's3.tag', heading: 's3.heading', shop1: 's3.shop1', shop1sub: 's3.shop1sub', shop2: 's3.shop2', shop2sub: 's3.shop2sub', confirm: 's3.confirm' },
];

export default function BookingAnimation({ onJoin }: { onJoin: () => void }) {
  const [active, setActive] = useState(0);
  const [voiceOn, setVoiceOn] = useState(false);

  useEffect(() => {
    if (voiceOn) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % SCENES.length), 3800);
    return () => window.clearInterval(timer);
  }, [voiceOn]);

  useEffect(() => {
    if (!voiceOn) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      return;
    }
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      setVoiceOn(false);
      return;
    }

    // The narration is in Hindi, as on the original explainer. The English text is on screen.
    const utterance = new SpeechSynthesisUtterance(messages.hi[SCENES[active].voice]);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1;
    let nextTimer: number | undefined;
    utterance.onend = () => {
      nextTimer = window.setTimeout(() => setActive((current) => (current + 1) % SCENES.length), 450);
    };
    utterance.onerror = () => setVoiceOn(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return () => {
      if (nextTimer !== undefined) window.clearTimeout(nextTimer);
      window.speechSynthesis.cancel();
    };
  }, [active, voiceOn]);

  const scene = SCENES[active];
  const SceneIcon = scene.icon;

  return (
    <section className="booking-film" aria-label={pair('film.aria')}>
      <div className="wrap booking-film-inner">
        <div className="booking-film-copy">
          <p className="eyebrow"><span className="live-dot" /> <Bi k="film.eyebrow"/></p>
          <h2><Bi k="film.title1"/><br /><em><Bi k="film.title2"/></em></h2>
          <p className="muted"><Bi k="film.body"/></p>
          <div className="film-scene-copy" aria-live="polite">
            <span><Bi k={scene.step}/></span>
            <h3><Bi k={scene.title}/></h3>
            <p><Bi k={scene.copy}/></p>
          </div>
          <div className="film-actions">
            <button className="button button-gold" onClick={onJoin}><Bi k="film.join" inline/> <span aria-hidden="true">→</span></button>
            <button
              className="film-voice-button"
              type="button"
              aria-pressed={voiceOn}
              onClick={() => setVoiceOn((enabled) => !enabled)}
            >
              {voiceOn ? <VolumeX size={17} /> : <Volume2 size={17} />}
              <Bi k={voiceOn ? 'film.voice.mute' : 'film.voice.play'} inline/>
            </button>
          </div>
          <p className="film-voice-hint"><Bi k="film.voice.hint"/></p>
        </div>

        <div className="booking-film-visual">
          <div className="film-glow" />
          <div className="film-phone">
            <div className="film-phone-top"><span>USTRA</span><span className="film-status"><i /> <Bi k="film.phone.live" inline/></span></div>
            <div className="film-map">
              <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
              <span className="map-pin pin-one"><MapPin size={17} /></span>
              <span className="map-pin pin-two"><MapPin size={17} /></span>
              <span className="map-pin pin-three"><MapPin size={17} /></span>
              <div className="map-you"><Bi k="film.phone.here" inline/></div>
            </div>
            <div className="film-phone-content">
              <div className="film-phone-heading"><div><small><Bi k={scene.tag} inline/></small><strong><Bi k={scene.heading} inline/></strong></div><span className="film-round-icon"><SceneIcon size={19} /></span></div>
              <div className="film-listing">
                <div className="film-shop-icon"><Scissors size={19}/></div><div><strong><Bi k={scene.shop1} inline/></strong><small><Bi k={scene.shop1sub} inline/></small></div><span className="film-listing-mark">{active === 2 ? <Check size={16}/> : '★ 4.8'}</span>
              </div>
              <div className="film-listing second">
                <div className="film-shop-icon"><Store size={19}/></div><div><strong><Bi k={scene.shop2} inline/></strong><small><Bi k={scene.shop2sub} inline/></small></div><span className="film-listing-mark">{active === 2 ? <Clock3 size={16}/> : '★ 4.6'}</span>
              </div>
              <div className="film-confirm"><CalendarCheck size={16}/><Bi k={scene.confirm} inline/></div>
            </div>
          </div>
          <div className="film-floating-note"><Clock3 size={16}/><span><strong><Bi k="film.note.title" inline/></strong><small><Bi k="film.note.sub" inline/></small></span></div>
          <div className="film-progress" aria-label={pair('film.scene.label', { n: active + 1 })}>
            {SCENES.map((item, index) => <button key={item.step} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={pair('film.scene.show', { n: index + 1 })} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
