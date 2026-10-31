'use client';
import {FcGoogle} from 'react-icons/fc';
import {supabaseBrowser} from '@/lib/supabase/client';
import {useT} from './I18nProvider';
export default function GoogleButton({next = '/', dark = false, before}: {next?: string; dark?: boolean; before?: () => void}) {
  const t = useT();
  const go = () => { before?.(); supabaseBrowser().auth.signInWithOAuth({provider: 'google', options: {redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`}}); };
  return (<button type="button" onClick={go} className={`btn ${dark ? 'bg-white text-ink' : 'border border-line bg-white text-ink'}`}><FcGoogle size={20} />{t('auth.google')}</button>);
}
