'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {X, Mail, Lock} from 'lucide-react';
import {supabaseBrowser} from '@/lib/supabase/client';
import GoogleButton from './GoogleButton';
export default function AuthForm({mode}: {mode: 'login' | 'signup'}) {
  const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const next = () => { const n = typeof window === 'undefined' ? '/' : new URLSearchParams(window.location.search).get('next') || '/'; return n.startsWith('/') ? n : '/'; };
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg('');
    const sb = supabaseBrowser();
    if (mode === 'signup') {
      const {data, error} = await sb.auth.signUp({email, password, options: {emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next())}`}});
      if (error) setMsg(error.message); else if (data.session) { router.push(next()); router.refresh(); } else setMsg('Check your email to confirm your account.');
    } else {
      const {error} = await sb.auth.signInWithPassword({email, password});
      if (error) setMsg(error.message); else { router.push(next()); router.refresh(); }
    }
    setBusy(false);
  }
  const wrap = 'relative';
  const icon = 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute';
  return (<div className="px-6 pt-6">
    <Link href="/" aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><X size={20} /></Link>
    <div className="mt-8 font-serif text-sm font-bold tracking-[.2em] text-leaf">BIBLESYN</div>
    <h1 className="mb-1 mt-2 font-serif text-[38px] font-bold leading-tight">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
    <p className="mb-7 text-[15px] text-mute">{mode === 'signup' ? 'Save your progress, journal and favorites.' : 'Understand the Word. Strengthen Your Spirit.'}</p>
    <form onSubmit={submit} className="space-y-3">
      <label className="sr-only" htmlFor="email">Email</label>
      <div className={wrap}><Mail size={18} className={icon} /><input id="email" className="field pl-12" type="email" required placeholder="Email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <label className="sr-only" htmlFor="password">Password</label>
      <div className={wrap}><Lock size={18} className={icon} /><input id="password" className="field pl-12" type="password" required minLength={8} placeholder="Password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></div>
      <button disabled={busy} className="btn-ink">{mode === 'signup' ? 'Create account' : 'Log in'}</button>
    </form>
    {msg && <p role="alert" className="mt-3 text-sm text-red-600">{msg}</p>}
    <div className="my-5 flex items-center gap-3 text-xs text-mute"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
    <GoogleButton next={typeof window === 'undefined' ? '/' : next()} />
    <p className="mt-7 text-center text-sm text-mute">{mode === 'signup' ? <>Already have an account? <Link className="font-semibold text-ink" href="/login">Log in</Link></> : <>New here? <Link className="font-semibold text-ink" href="/signup">Create an account</Link></>}</p>
    <p className="mt-3 text-center"><Link className="text-sm text-mute underline" href="/">Continue without an account</Link></p>
  </div>);
}
