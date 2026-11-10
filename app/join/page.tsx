'use client';

import { useEffect, useState } from 'react';
import WaitlistForm from '@/components/WaitlistForm';
import styles from './join.module.css';

type Kind = 'customer' | 'business';

// One shareable link: /join opens the registration form with both options at the top.
// /join?join=business opens the barber/business side first.
export default function JoinPage() {
  const [kind, setKind] = useState<Kind>('customer');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('join') === 'business') setKind('business');
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.switch} role="tablist" aria-label="How are you joining?">
          <button
            type="button"
            role="tab"
            aria-selected={kind === 'customer'}
            className={`${styles.option} ${kind === 'customer' ? styles.active : ''}`}
            onClick={() => setKind('customer')}
          >
            I AM A CUSTOMER
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={kind === 'business'}
            className={`${styles.option} ${kind === 'business' ? styles.active : ''}`}
            onClick={() => setKind('business')}
          >
            I AM A BARBER / BUSINESS
          </button>
        </div>
        <WaitlistForm kind={kind} onClose={() => { window.location.href = '/'; }} />
      </div>
    </main>
  );
}
