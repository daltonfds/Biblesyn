'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {supabaseBrowser} from '@/lib/supabase/client';
export default function AuthForm({mode}:{mode:'login'|'signup'}){
 const router=useRouter();
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');
 const [msg,setMsg]=useState('');const [busy,setBusy]=useState(false);
 const next=()=>{const n=new URLSearchParams(window.location.search).get('next')||'/';return n.startsWith('/')?n:'/'};
 const cb=()=>`${window.location.origin}/auth/callback?next=${encodeURIComponent(next())}`;
 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setMsg('');const sb=supabaseBrowser();
  if(mode==='signup'){const {data,error}=await sb.auth.signUp({email,password,options:{emailRedirectTo:cb()}});if(error)setMsg(error.message);else if(data.session){router.push(next());router.refresh()}else setMsg('Check your email to confirm your account.')}
  else{const {error}=await sb.auth.signInWithPassword({email,password});if(error)setMsg(error.message);else{router.push(next());router.refresh()}}
  setBusy(false);
 }
 async function google(){setBusy(true);setMsg('');const {error}=await supabaseBrowser().auth.signInWithOAuth({provider:'google',options:{redirectTo:cb()}});if(error){setMsg(error.message);setBusy(false)}}
 return <div className="px-7 pb-12 pt-14">
  <Link href="/" className="text-[11px] font-semibold tracking-[.24em] text-green">BIBLESYN</Link>
  <div className="mt-14"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-green">{mode==='signup'?'BEGIN YOUR JOURNEY':'WELCOME BACK'}</p><h1 className="mt-3 font-serif text-[38px] font-semibold leading-tight">{mode==='signup'?'Create your account':'Welcome back'}</h1><p className="mt-3 max-w-[300px] text-sm leading-6 text-muted">{mode==='signup'?'Save your progress, journal and continue growing in the Word.':'Understand the Word. Strengthen your Spirit.'}</p></div>
  <form onSubmit={submit} className="mt-9 space-y-5">
   <label className="block text-xs font-semibold">Email address<input className="mt-2 h-12 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-green" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
   <label className="block text-xs font-semibold">Password<input className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3.5 text-sm outline-none transition focus:border-green" type="password" autoComplete={mode==='signup'?'new-password':'current-password'} required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label>
   <button disabled={busy} className="flex h-12 w-full items-center justify-center rounded-xl bg-ink px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#292929] disabled:opacity-60">{busy?'Please wait…':mode==='signup'?'Create account':'Log in'}</button>
  </form>
  {msg&&<p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{msg}</p>}
  <div className="my-7 flex items-center gap-4 text-[10px] uppercase tracking-[.15em] text-[#A0A0A0]"><span className="h-px flex-1 bg-line"/><span>or continue with</span><span className="h-px flex-1 bg-line"/></div>
  <button type="button" onClick={google} disabled={busy} className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-5 py-3.5 text-sm font-semibold text-ink transition hover:bg-[#FAFAFA] disabled:opacity-60">
   <svg aria-hidden="true" width="19" height="19" viewBox="0 0 48 48"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.6c3.9-3.6 6.1-8.8 6.1-15Z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.6-5.1c-1.8 1.2-4.1 2-6.9 2-5.3 0-9.8-3.6-11.4-8.4H5.8v5.3A20 20 0 0 0 24 44Z"/><path fill="#FBBC05" d="M12.6 27.6a12 12 0 0 1 0-7.2v-5.3H5.8a20 20 0 0 0 0 17.8l6.8-5.3Z"/><path fill="#EA4335" d="M24 12c3 0 5.7 1 7.8 3.1l5.8-5.8C34.1 6 29.5 4 24 4A20 20 0 0 0 5.8 15.1l6.8 5.3C14.2 15.6 18.7 12 24 12Z"/></svg>
   Continue with Google
  </button>
  <p className="mt-8 text-center text-sm text-muted">{mode==='signup'?<>Already have an account? <Link className="font-semibold text-ink underline underline-offset-4" href="/login">Log in</Link></>:<>New to Biblesyn? <Link className="font-semibold text-ink underline underline-offset-4" href="/signup">Create an account</Link></>}</p>
  <p className="mt-5 text-center"><Link className="text-xs text-muted underline underline-offset-4" href="/">Continue without an account</Link></p>
 </div>;
}