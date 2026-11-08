'use client';

import { useEffect, useState } from 'react';
import { Bi, pair } from '@/lib/i18n';

const enc = encodeURIComponent;

// Each channel builds its own share link from the message and the page address.
const CHANNELS: { name: string; link: (text: string, url: string) => string }[] = [
  { name: 'WhatsApp', link: (text, url) => `https://wa.me/?text=${enc(`${text} ${url}`)}` },
  { name: 'Telegram', link: (text, url) => `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}` },
  { name: 'Facebook', link: (_text, url) => `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
  { name: 'X', link: (text, url) => `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
  { name: 'Email', link: (text, url) => `mailto:?subject=${enc(pair('share.subject'))}&body=${enc(`${text}\n${url}`)}` },
];

/** The address of the page the visitor is on. Every share link points here. */
function pageAddress(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

export default function ShareButtons() {
  const [status, setStatus] = useState('');

  // The status line clears itself after a few seconds.
  useEffect(() => {
    if (!status) return;
    const id = window.setTimeout(() => setStatus(''), 3500);
    return () => window.clearTimeout(id);
  }, [status]);

  async function copyLink(): Promise<boolean> {
    const url = pageAddress();
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch {
      // Some browsers block the clipboard API. Fall back to a hidden text field.
      const field = document.createElement('textarea');
      field.value = url;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand('copy');
      document.body.removeChild(field);
      return copied;
    }
  }

  async function copy() {
    setStatus((await copyLink()) ? pair('share.copied') : pair('share.copy.failed'));
  }

  // Instagram has no web share link. On phones the system share sheet offers Instagram.
  // Elsewhere the link is copied, so it can be pasted into Instagram.
  async function shareToInstagram() {
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'USTRA', text: pair('share.message'), url: pageAddress() });
        return;
      } catch (err) {
        // The visitor closed the share sheet. Nothing else to do.
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }
    setStatus((await copyLink()) ? pair('share.instagram.hint') : pair('share.copy.failed'));
  }

  function openChannel(link: (text: string, url: string) => string) {
    const target = link(pair('share.message'), pageAddress());
    if (target.startsWith('mailto:')) window.location.href = target;
    else window.open(target, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="share">
      <p className="share-title"><Bi k="share.heading" /></p>
      <p className="share-hint"><Bi k="share.hint" /></p>
      <div className="share-row">
        {CHANNELS.map((channel) => (
          <button key={channel.name} type="button" className="button button-outline share-btn" onClick={() => openChannel(channel.link)}>
            {channel.name}
          </button>
        ))}
        <button type="button" className="button button-outline share-btn" onClick={shareToInstagram}>Instagram</button>
        <button type="button" className="button button-outline share-btn" onClick={copy}><Bi k="share.copy" inline /></button>
      </div>
      <p className="share-status" role="status" aria-live="polite">{status}</p>
    </div>
  );
}
