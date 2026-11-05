'use client';

import { useEffect, useRef, useState } from 'react';
import { VIDEO_CLIPS, type VideoClip } from '@/lib/videoClips';

type EventName = 'start' | 'unmute' | 'q25' | 'q50' | 'q75' | 'complete' | 'stop';

// One id per browser tab, kept in sessionStorage. It is anonymous and holds no personal data.
function getSessionId(): string {
  const key = 'ustra_video_session';
  try {
    const saved = window.sessionStorage.getItem(key);
    if (saved && /^[A-Za-z0-9_-]{8,64}$/.test(saved)) return saved;
    const created = crypto.randomUUID();
    window.sessionStorage.setItem(key, created);
    return created;
  } catch {
    return `s${Math.random().toString(36).slice(2, 12)}${Date.now().toString(36)}`;
  }
}

// Sends one event. Failures are ignored: tracking must never break the page.
function sendEvent(session: string, clip: string, event: EventName, position: number, watched: number) {
  try {
    fetch('/api/video-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session,
        clip,
        event,
        position: Math.round(position * 100) / 100,
        watched: Math.round(watched * 100) / 100,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore
  }
}

function ClipCard({ clip }: { clip: VideoClip }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const tracking = useRef({
    session: '',
    started: false,
    unmuted: false,
    playing: false,
    watched: 0, // seconds actually played in this page view
    sentWatched: 0, // last value sent to the server
    lastTime: 0,
    marks: new Set<number>(),
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const t = tracking.current;
    t.session = getSessionId();
    video.muted = true; // browsers allow autoplay only when muted

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReduceMotion(reduce);

    const report = (event: EventName) => {
      sendEvent(t.session, clip.id, event, video.currentTime, t.watched);
      t.sentWatched = t.watched;
    };

    const onPlay = () => {
      t.playing = true;
      if (!t.started) {
        t.started = true;
        report('start');
      }
    };

    const onTimeUpdate = () => {
      const now = video.currentTime;
      if (t.playing) {
        const step = now - t.lastTime;
        // Ignore jumps (seeking) so only real playing time is counted.
        if (step > 0 && step < 1.5) t.watched += step;
      }
      t.lastTime = now;
      const duration = video.duration;
      if (Number.isFinite(duration) && duration > 0) {
        const percent = (now / duration) * 100;
        for (const mark of [25, 50, 75]) {
          if (percent >= mark && !t.marks.has(mark)) {
            t.marks.add(mark);
            report(`q${mark}` as EventName);
          }
        }
      }
    };

    const onPause = () => {
      t.playing = false;
      if (t.watched !== t.sentWatched) report('stop');
    };

    const onEnded = () => {
      t.playing = false;
      report('complete');
    };

    const onHidden = () => {
      if (document.visibilityState === 'hidden' && t.watched !== t.sentWatched) report('stop');
    };

    const onPageHide = () => {
      if (t.watched !== t.sentWatched) report('stop');
    };

    // Play only while the clip is mostly on screen; pause when scrolled away.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          if (!reduce) {
            video.play().catch(() => {
              // The browser blocked sound on autoplay. Fall back to muted playback so the clip still runs.
              video.muted = true;
              setMuted(true);
              video.play().catch(() => {});
            });
          }
        } else {
          video.pause();
        }
      },
      { threshold: [0, 0.6] },
    );
    observer.observe(video);

    video.addEventListener('play', onPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      observer.disconnect();
      video.removeEventListener('play', onPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [clip.id]);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    const t = tracking.current;
    video.muted = !video.muted;
    setMuted(video.muted);
    // Turning sound on is a strong sign of interest, so it is counted once per page view.
    if (!video.muted && !t.unmuted) {
      t.unmuted = true;
      sendEvent(t.session, clip.id, 'unmute', video.currentTime, t.watched);
    }
  }

  return (
    <figure className="reel-card">
      <div className="reel-frame" style={{ aspectRatio: clip.ratio }}>
        <video
          ref={videoRef}
          src={clip.src}
          poster={clip.poster}
          preload="metadata"
          playsInline
          controls={reduceMotion}
          aria-label={clip.title}
        />
        {!reduceMotion && (
          <button type="button" className="reel-sound" onClick={toggleSound} aria-pressed={!muted}>
            {muted ? 'Sound on' : 'Sound off'}
          </button>
        )}
      </div>
      <figcaption>{clip.title}</figcaption>
    </figure>
  );
}

export default function VideoReel() {
  if (VIDEO_CLIPS.length === 0) return null;
  return (
    <section className="reel wrap" aria-label="Videos">
      <p className="eyebrow">SEE USTRA IN ACTION</p>
      <h2>
        Watch how it <em>works.</em>
      </h2>
      <div className="reel-grid">
        {VIDEO_CLIPS.map((clip) => (
          <ClipCard key={clip.id} clip={clip} />
        ))}
      </div>
    </section>
  );
}
