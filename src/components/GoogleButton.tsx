'use client';
import {useState} from 'react';
import {FcGoogle} from 'react-icons/fc';
import {supabaseBrowser} from '@/lib/supabase/client';
import {useT} from './I18nProvider';

export default function GoogleButton({next = '/home', dark = false, before}: {next?: string; dark?: boolean; before?: () => void}) {
  const t = useT();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setError('');
    setBusy(true);
    try {
      before?.();
      const locale = window.location.pathname.split('/')[1] || 'en';
      const localizedNext = next.startsWith('/' + locale + '/') ? next : '/' + locale + (next.startsWith('/') ? next : '/' + next);
      const callback = new URL('/' + locale + '/auth/callback', window.location.origin);
      callback.searchParams.set('next', localizedNext);
      const {error: oauthError} = await supabaseBrowser().auth.signInWithOAuth({
        provider: 'google',
        options: {redirectTo: callback.toString()},
      });
      if (oauthError) {
        setError(oauthError.message);
        setBusy(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar o login com Google.');
      setBusy(false);
    }
  };
  return (
    <div>
      <button type="button" onClick={go} disabled={busy} className={`btn ${dark ? 'bg-white text-ink' : 'border border-line bg-white text-ink'} disabled:opacity-60`}>
        <FcGoogle size={20} />{busy ? 'A ligar ao Google…' : t('auth.google')}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
