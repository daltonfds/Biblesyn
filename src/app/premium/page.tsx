import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import Icon from '@/components/Icon';
const FEATURES=['Full Spiritual Library','Bible AI Assistant','Complete study plans','Audio for every study','Personal spiritual journal'];
export default async function Premium(){
 const {data:{user}}=await supabaseServer().auth.getUser();
 return <div className="px-6 pb-12 pt-12">
  <Link href="/" className="text-[10px] font-semibold tracking-[.24em] text-green">BIBLESYN</Link>
  <div className="mt-14"><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-green">BIBLESYN PREMIUM</p><h1 className="mt-3 font-serif text-[40px] font-semibold leading-[1.08]">One plan.<br/>The whole experience.</h1><p className="mt-4 text-sm leading-6 text-muted">Everything you need to study deeply, reflect honestly and grow consistently.</p></div>
  <div className="mt-9 rounded-[26px] bg-ink p-6 text-white"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.2em] text-[#A9C7B4]">PREMIUM MEMBERSHIP</span><Icon name="sparkles" className="text-[#A9C7B4]"/></div><div className="mt-5 flex items-end gap-2"><span className="font-serif text-6xl font-semibold">$1</span><span className="pb-2 text-sm text-white/60">/ month</span></div><p className="mt-1 text-xs text-white/60">Cancel anytime.</p><div className="my-6 h-px bg-white/15"/><ul className="space-y-4">{FEATURES.map(f=><li key={f} className="flex items-center gap-3 text-sm"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[#A9C7B4]"><Icon name="check" size={13}/></span>{f}</li>)}</ul></div>
  {user?<form action="/api/stripe/checkout" method="post" className="mt-5"><button className="h-14 w-full rounded-full bg-green px-5 text-sm font-semibold text-white transition hover:bg-[#20543B]">Subscribe · $1/month</button></form>:<Link href="/signup?next=/premium" className="mt-5 block rounded-full bg-ink py-4 text-center text-sm font-semibold text-white transition hover:bg-green">Create account to subscribe</Link>}
  <p className="mt-5 text-center text-[11px] leading-5 text-muted">Secure recurring payment through Stripe. Renews monthly until cancelled.</p>
 </div>;
}