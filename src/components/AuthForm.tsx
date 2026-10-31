'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {X, Mail, Lock, Globe, Languages} from 'lucide-react';
import {supabaseBrowser} from '@/lib/supabase/client';
import GoogleButton from './GoogleButton';
import {useT} from './I18nProvider';
type Country = {code: string; name: string; default_locale: string | null}; type Lang = {code: string; name: string; native_name: string | null};
const setCookie = (k: string, v: string) => { document.cookie = `${k}=${encodeURIComponent(v)};path=/;max-age=31536000;samesite=lax`; };
export default function AuthForm({mode, countries, languages, defaultCountry, defaultLocale}: {mode: 'login' | 'signup'; countries: Country[]; languages: Lang[]; defaultCountry: string; defaultLocale: string}) {
  const t = useT(); const router = useRouter();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const [country, setCountry] = useState(countries.some(c => c.code === defaultCountry) ? defaultCountry : countries[0]?.code ?? ''); const [locale, setLocale] = useState(defaultLocale);
  const next = () => { const n = typeof window === 'undefined' ? '/' : new URLSearchParams(window.location.search).get('next') || '/'; return n.startsWith('/') && !n.startsWith('//') ? n : '/'; };
  const post = (b: object) => fetch('/api/prefs', {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(b)});
  function pickCountry(code: string) { setCountry(code); const l = countries.find(c => c.code === code)?.default_locale; if (l && languages.some(x => x.code === l)) pickLocale(l); }
  function pickLocale(l: string) { setLocale(l); setCookie('locale', l); router.refresh(); }
  const remember = () => { setCookie('country', country); setCookie('locale', locale); };
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg(''); const sb = supabaseBrowser();
    if (mode === 'signup') {
      remember();
      const {data, error} = await sb.auth.signUp({email, password, options: {data: {country, locale}, emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next())}`}});
      if (error) setMsg(error.message); else if (data.session) { await post({country, locale}); router.push(next()); router.refresh(); } else setMsg(t('auth.check_email'));
    } else {
      const {error} = await sb.auth.signInWithPassword({email, password});
      if (error) setMsg(error.message); else { await post({sync: true}); router.push(next()); router.refresh(); }
    }
    setBusy(false);
  }
  const icon = 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-mute';
  return (<div className="mx-auto max-w-md px-6 pt-11">
    <Link href="/" aria-label={t('common.close')} className="flex h-10 w-10 items-center justify-center rounded-full bg-mist"><X size={20} /></Link>
    <div className="mt-8 font-serif text-sm font-bold tracking-[.2em] text-leaf">BIBLESYN</div>
    <h1 className="mb-1 mt-2 font-serif text-[38px] font-bold leading-tight">{mode === 'signup' ? t('auth.create_title') : t('auth.welcome_back')}</h1>
    <p className="mb-7 text-[15px] text-mute">{mode === 'signup' ? t('auth.create_sub') : t('auth.tagline')}</p>
    <form onSubmit={submit} className="space-y-3">
      <label className="sr-only" htmlFor="email">{t('auth.email')}</label>
      <div className="relative"><Mail size={20} className={icon} /><input id="email" className="field pl-12" type="email" required placeholder={t('auth.email')} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <label className="sr-only" htmlFor="password">{t('auth.password')}</label>
      <div className="relative"><Lock size={20} className={icon} /><input id="password" className="field pl-12" type="password" required minLength={8} placeholder={t('auth.password')} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onChange={e => setPassword(e.target.value)} /></div>
      {mode === 'signup' && <>
        <div className="relative"><Globe size={20} className={icon} /><select aria-label={t('auth.country')} className="field appearance-none pl-12" value={country} onChange={e => pickCountry(e.target.value)}>{countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
        <div className="relative"><Languages size={20} className={icon} /><select aria-label={t('auth.language')} className="field appearance-none pl-12" value={locale} onChange={e => pickLocale(e.target.value)}>{languages.map(l => <option key={l.code} value={l.code}>{l.native_name || l.name}</option>)}</select></div></>}
      <button disabled={busy} className="btn-ink">{mode === 'signup' ? t('auth.create_btn') : t('auth.login_btn')}</button>
    </form>
    {msg && <p role="alert" className="mt-3 text-sm text-red-600">{msg}</p>}
    <div className="my-5 flex items-center gap-3 text-xs text-mute"><span className="h-px flex-1 bg-line" />{t('auth.or')}<span className="h-px flex-1 bg-line" /></div>
    <GoogleButton next={typeof window === 'undefined' ? '/' : next()} before={mode === 'signup' ? remember : undefined} />
    <p className="mt-7 text-center text-sm text-mute">{mode === 'signup' ? <>{t('auth.have_account')} <Link className="font-semibold text-ink" href="/login">{t('common.login')}</Link></> : <>{t('auth.new_here')} <Link className="font-semibold text-ink" href="/signup">{t('auth.create_link')}</Link></>}</p>
    <p className="mt-3 text-center"><Link className="text-sm text-mute underline" href="/">{t('auth.guest')}</Link></p>
  </div>);
}
