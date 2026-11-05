'use client';

import { useEffect, useState } from 'react';
import { CalendarCheck, Check, Clock3, MapPin, Scissors, Store, Volume2, VolumeX } from 'lucide-react';

const scenes = [
  {
    step: '01 / DISCOVER',
    title: 'Find the right salon, nearby.',
    copy: 'Explore trusted barbers and salons around your neighbourhood — all in one place.',
    voice: 'USTRA पर अपने आसपास के अच्छे सैलून और बार्बर आसानी से खोजें। अब अलग-अलग जगह फोन करने या भटकने की ज़रूरत नहीं।',
    tag: 'SALONS NEAR YOU',
    icon: MapPin,
  },
  {
    step: '02 / CHOOSE A SLOT',
    title: 'Your time. Your appointment.',
    copy: 'Compare services, choose the professional you like, and pick a time that works for you.',
    voice: 'अपनी पसंद का सैलून और सर्विस चुनें। फिर अपनी सुविधा के अनुसार अपॉइंटमेंट का समय बुक करें।',
    tag: 'PICK YOUR TIME',
    icon: CalendarCheck,
  },
  {
    step: '03 / YOU’RE BOOKED',
    title: 'Skip the wait. Enjoy your day.',
    copy: 'Get your appointment details and spend less time searching or waiting around.',
    voice: 'बस, आपकी बुकिंग हो गई। अब लंबा इंतज़ार और बेवजह की भागदौड़ कम। USTRA के साथ अपना समय बचाएँ और बेफिक्र रहें।',
    tag: 'BOOKING CONFIRMED',
    icon: Check,
  },
];

export default function BookingAnimation({ onJoin }: { onJoin: () => void }) {
  const [active, setActive] = useState(0);
  const [voiceOn, setVoiceOn] = useState(false);

  useEffect(() => {
    if (voiceOn) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % scenes.length), 3800);
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

    const utterance = new SpeechSynthesisUtterance(scenes[active].voice);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.92;
    utterance.pitch = 1;
    let nextTimer: number | undefined;
    utterance.onend = () => {
      nextTimer = window.setTimeout(() => setActive((current) => (current + 1) % scenes.length), 450);
    };
    utterance.onerror = () => setVoiceOn(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return () => {
      if (nextTimer !== undefined) window.clearTimeout(nextTimer);
      window.speechSynthesis.cancel();
    };
  }, [active, voiceOn]);

  const scene = scenes[active];
  const SceneIcon = scene.icon;

  return (
    <section className="booking-film" aria-label="How USTRA makes salon bookings easier">
      <div className="wrap booking-film-inner">
        <div className="booking-film-copy">
          <p className="eyebrow"><span className="live-dot" /> LESS SEARCHING. MORE LIVING.</p>
          <h2>YOUR NEXT VISIT.<br /><em>WITHOUT THE WAIT.</em></h2>
          <p className="muted">USTRA brings customers and local grooming professionals together, so finding and booking your next appointment feels simple.</p>
          <div className="film-scene-copy" aria-live="polite">
            <span>{scene.step}</span>
            <h3>{scene.title}</h3>
            <p>{scene.copy}</p>
          </div>
          <div className="film-actions">
            <button className="button button-gold" onClick={onJoin}>JOIN THE WAITLIST <span aria-hidden="true">→</span></button>
            <button
              className="film-voice-button"
              type="button"
              aria-pressed={voiceOn}
              onClick={() => setVoiceOn((enabled) => !enabled)}
            >
              {voiceOn ? <VolumeX size={17} /> : <Volume2 size={17} />}
              {voiceOn ? 'आवाज़ बंद करें' : 'हिंदी में सुनें'}
            </button>
          </div>
          <p className="film-voice-hint">आवाज़ सुनने के लिए बटन दबाएँ।</p>
        </div>

        <div className="booking-film-visual">
          <div className="film-glow" />
          <div className="film-phone">
            <div className="film-phone-top"><span>USTRA</span><span className="film-status"><i /> LIVE PREVIEW</span></div>
            <div className="film-map">
              <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
              <span className="map-pin pin-one"><MapPin size={17} /></span>
              <span className="map-pin pin-two"><MapPin size={17} /></span>
              <span className="map-pin pin-three"><MapPin size={17} /></span>
              <div className="map-you">YOU ARE HERE</div>
            </div>
            <div className="film-phone-content">
              <div className="film-phone-heading"><div><small>{scene.tag}</small><strong>{active === 0 ? 'Find your barber' : active === 1 ? 'Choose your slot' : 'All set!'}</strong></div><span className="film-round-icon"><SceneIcon size={19} /></span></div>
              <div className="film-listing">
                <div className="film-shop-icon"><Scissors size={19}/></div><div><strong>{active === 0 ? 'The Groom Room' : active === 1 ? 'Classic Hair Studio' : 'Appointment saved'}</strong><small>{active === 0 ? 'Barber shop · 0.8 km away' : active === 1 ? 'Haircut · Today, 5:30 PM' : 'Today · 5:30 PM'}</small></div><span className="film-listing-mark">{active === 2 ? <Check size={16}/> : '★ 4.8'}</span>
              </div>
              <div className="film-listing second">
                <div className="film-shop-icon"><Store size={19}/></div><div><strong>{active === 0 ? 'Urban Style Salon' : active === 1 ? 'Your time is reserved' : 'More time for you'}</strong><small>{active === 0 ? 'Unisex salon · 1.2 km away' : active === 1 ? 'No more calling around' : 'Less searching, less waiting'}</small></div><span className="film-listing-mark">{active === 2 ? <Clock3 size={16}/> : '★ 4.6'}</span>
              </div>
              <div className="film-confirm"><CalendarCheck size={16}/>{active === 2 ? 'BOOKING CONFIRMED' : active === 1 ? 'SELECT A CONVENIENT TIME' : 'DISCOVER · COMPARE · BOOK'}</div>
            </div>
          </div>
          <div className="film-floating-note"><Clock3 size={16}/><span><strong>YOUR TIME MATTERS</strong><small>Make every visit count</small></span></div>
          <div className="film-progress" aria-label={`Scene ${active + 1} of 3`}>
            {scenes.map((item, index) => <button key={item.step} className={index === active ? 'active' : ''} onClick={() => setActive(index)} aria-label={`Show scene ${index + 1}`} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
