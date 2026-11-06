'use client';

import { useEffect, useState } from 'react';

/** Shows how many people have joined the waitlist. It stays hidden if the count is zero or fails to load. */
export default function SignupCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/waitlist/count')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data && typeof data.total === 'number') setTotal(data.total);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (total === null || total < 1) return null;

  return (
    <p className="signup-counter">
      <span className="live-dot" />
      <strong>{total.toLocaleString('en-IN')}</strong> people have already joined the waitlist
    </p>
  );
}
