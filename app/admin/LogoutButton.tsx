'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={logout}
      style={{ background: 'transparent', color: '#f5f1ea', border: '1px solid #2c2c33', borderRadius: 10, padding: '8px 14px', cursor: 'pointer' }}
    >
      Sign out
    </button>
  );
}
