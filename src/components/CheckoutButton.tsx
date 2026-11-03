'use client';
import {useState} from 'react';
import {useLocale} from 'next-intl';

export default function CheckoutButton({
  children,
  className = 'btn',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const locale = useLocale();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function checkout() {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {'content-type': 'application/json'},
        body: JSON.stringify({locale}),
      });
      const data = await response.json();
      if (response.status === 401) {
        window.location.assign(`/${locale}/login?next=/${locale}/oferta-privada`);
        return;
      }
      if (!response.ok || !data.url) throw new Error(data.error || 'checkout_unavailable');
      window.location.assign(data.url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'checkout_unavailable');
      setBusy(false);
    }
  }
  return (
    <div>
      <button type="button" onClick={checkout} disabled={busy} className={className} style={style}>
        {busy ? '…' : children}
      </button>
      {error && <p role="alert" className="mt-2 text-center text-xs text-red-600">{error}</p>}
    </div>
  );
}
