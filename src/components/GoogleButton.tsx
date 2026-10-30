'use client';
import {FcGoogle} from 'react-icons/fc';
import {supabaseBrowser} from '@/lib/supabase/client';
export default function GoogleButton({next = '/', dark = false}: {next?: string; dark?: boolean}) {
  const go = () => supabaseBrowser().auth.signInWithOAuth({provider: 'google', options: {redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`}});
  return (<button type="button" onClick={go} className={`btn ${dark ? 'bg-white text-ink' : 'border border-line bg-white text-ink'}`}><FcGoogle size={20} />Continue with Google</button>);
}
