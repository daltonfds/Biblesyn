import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
const FEATURES = ['Full Spiritual Library', 'Bible AI Assistant', 'Complete study plans', 'Audio studies', 'Personal spiritual journal'];
export default async function Premium() {
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  return (<div className="px-6 pt-14"><div className="text-xs tracking-[.2em] text-[#8A6A33]">BIBLESYN PREMIUM</div>
    <h1 className="mb-5 mt-2 font-serif text-4xl font-semibold leading-tight">Go deeper in the Word.</h1>
    <ul className="mb-5 space-y-2 text-sm">{FEATURES.map(f => <li key={f}>✓ {f}</li>)}</ul>
    <div className="flex items-center justify-between rounded-3xl border-2 border-gold bg-parchment p-5"><div><div className="text-sm font-semibold">Monthly membership</div><div className="text-xs text-[#6F5A40]">Cancel anytime</div></div><div className="font-serif text-4xl font-bold">$1<span className="font-sans text-xs font-normal text-[#6F5A40]">/month</span></div></div>
    {user ? <form action="/api/stripe/checkout" method="post" className="mt-5"><button className="h-14 w-full rounded-full bg-brown font-semibold text-ivory">Subscribe · $1/month</button></form>
      : <Link href="/signup?next=/premium" className="mt-5 block rounded-full bg-brown py-4 text-center font-semibold text-ivory">Create account to subscribe</Link>}
    <p className="mt-4 text-center text-[11px] text-[#6F5A40]">Secure recurring payment through Stripe. Renews monthly until cancelled.</p></div>);
}