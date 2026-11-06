'use client';

import { useEffect, useRef } from 'react';
import { getVisitId, trackStep } from '@/lib/tracking';

const HEARTBEAT_MS = 5000;
const ENDPOINT = '/api/video-view';

/** The promo video. It sends anonymous viewing numbers: plays, seconds watched and how far it got. */
export default function PromoVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const visitId = getVisitId();
    const device = window.innerWidth < 768 ? 'mobile' : 'desktop';
    let plays = 0;
    let watched = 0;
    let position = 0;
    let duration: number | null = null;
    let lastTime: number | null = null;
    let lastSent = '';

    function send(useBeacon: boolean) {
      if (plays === 0) return; // Only visits where the video was actually played are recorded.
      const body = JSON.stringify({
        visitId,
        device,
        plays,
        watched: Math.round(watched * 10) / 10,
        position: Math.round(position * 10) / 10,
        duration,
      });
      if (body === lastSent) return;
      lastSent = body;
      if (useBeacon && navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
      } else {
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {});
      }
    }

    const onPlay = () => {
      plays += 1;
      if (plays === 1) trackStep('play');
      lastTime = video.currentTime;
    };
    const onTimeUpdate = () => {
      if (video.paused) return;
      const t = video.currentTime;
      // Count only normal playback. A jump (seeking) is not counted as watching.
      if (lastTime !== null && t - lastTime > 0 && t - lastTime < 1.5) watched += t - lastTime;
      position = Math.max(position, t);
      lastTime = t;
    };
    const onSeeking = () => {
      lastTime = null;
    };
    const onStop = () => {
      lastTime = null;
      send(true);
    };
    const onMeta = () => {
      if (Number.isFinite(video.duration)) duration = video.duration;
    };
    const onHidden = () => {
      if (document.visibilityState === 'hidden') send(true);
    };

    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('play', onPlay);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('seeking', onSeeking);
    video.addEventListener('pause', onStop);
    video.addEventListener('ended', onStop);
    document.addEventListener('visibilitychange', onHidden);
    window.addEventListener('pagehide', onStop);

    const heartbeat = window.setInterval(() => {
      if (!video.paused) send(false);
    }, HEARTBEAT_MS);

    return () => {
      window.clearInterval(heartbeat);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('seeking', onSeeking);
      video.removeEventListener('pause', onStop);
      video.removeEventListener('ended', onStop);
      document.removeEventListener('visibilitychange', onHidden);
      window.removeEventListener('pagehide', onStop);
    };
  }, []);

  return (
    <video
      ref={ref}
      src="/ustra-promo-9x16.mp4"
      controls
      playsInline
      preload="metadata"
      style={{
        display: 'block',
        width: '100%',
        maxWidth: 360,
        margin: '0 auto',
        border: '1px solid var(--line)',
        borderRadius: 24,
        background: '#000',
      }}
    />
  );
}
