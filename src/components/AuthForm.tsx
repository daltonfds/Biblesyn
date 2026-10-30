'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {supabaseBrowser} from '@/lib/supabase/client';
export default function AuthForm({mode}: {mode: 'login' | 'signup'}) {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const next = () => { const n = new URLSearchParams(window.location.search).get('next') || '/'; return n.startsWith('/') ? n : '/'; };
  const cb = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next())}`;
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const sb = supabaseBrowser();
    if (mode === 'signup') {
      const {data, error} = await sb.auth.signUp({email, password, options: {emailRedirectTo: cb()}});
      if (error) setMsg(error.message); else if (data.session) { router.push(next()); router.refresh(); } else setMsg('Check your email to confirm your account.');
    } else {
      const {error} = await sb.auth.signInWithPassword({email, password});
      if (error) setMsg(error.message); else { router.push(next()); router.refresh(); }
    }
    setBusy(false);
  }
  const google = () => supabaseBrowser().auth.signInWithOAuth({provider: 'google', options: {redirectTo: cb()}});
  const input = 'mt-1 h-12 w-full rounded-full border border-[#D9C6A0] bg-[#FFFDF8] px-5 text-sm';
  return (<div className="px-7 pt-20">
    <div className="text-xs tracking-[.2em] text-[#8A6A33]">BIBLESYN</div>
    <h1 className="mb-6 mt-2 font-serif text-4xl font-semibold">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-xs text-[#6F5A40]">Email<input className={input} type="email" required value={email} onChange={e => setEmail(e.target.value)} /></label>
      <label className="block text-xs text-[#6F5A40]">Password<input className={input} type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} /></label>
      <button disabled={busy} className="h-12 w-full rounded-full bg-brown font-semibold text-ivory">{mode === 'signup' ? 'Create account' : 'Log in'}</button>
    </form>
    {msg && <p role="alert" className="mt-3 text-sm text-[#8A2F2F]">{msg}</p>}
    <div className="my-5 text-center text-xs text-[#6F5A40]">or</div>
    <button onClick={google} className="h-12 w-full rounded-full border border-gold bg-[#FFFDF8] text-sm font-medium">Continue with Google</button>
    <p className="mt-6 text-center text-sm text-[#6F5A40]">{mode === 'signup' ? <>Have an account? <Link className="font-semibold text-brown" href="/login">Log in</Link></> : <>New here? <Link className="font-semibold text-brown" href="/signup">Create an account</Link></>}</p>
    <p className="mt-2 text-center"><Link className="text-sm text-[#6F5A40]" href="/">Continue without an account</Link></p>
  </div>);
}