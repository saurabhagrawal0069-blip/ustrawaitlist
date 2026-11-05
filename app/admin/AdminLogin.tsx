'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Login failed. Please try again.');
        return;
      }
      router.refresh();
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 360, display: 'grid', gap: 12, marginTop: 16 }}>
      <input
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="Admin password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ background: '#131316', border: '1px solid #2c2c33', borderRadius: 10, padding: '12px 14px', color: '#f5f1ea', fontSize: 15 }}
      />
      {error && <p style={{ color: '#ff8a80', margin: 0, fontSize: 14 }}>{error}</p>}
      <button
        type="submit"
        disabled={busy}
        style={{ background: '#ffd95e', color: '#0b0b0c', border: 0, borderRadius: 10, padding: '12px 14px', fontWeight: 700, cursor: 'pointer' }}
      >
        {busy ? 'Checking...' : 'Sign in'}
      </button>
    </form>
  );
}
