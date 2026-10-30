import {cookies, headers} from 'next/headers';
import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
const FEATURES = ['Full Spiritual Library', 'Bible AI Assistant', 'All study plans', 'Audio for every study', 'Journal and growth dashboard'];
export default async function Premium({searchParams}: {searchParams: {country?: string}}) {
  const sb = supabaseServer();
  const {data: prices} = await sb.from('prices').select('country,currency,amount_cents').eq('active', true).order('country');
  const wanted = (searchParams.country || cookies().get('country')?.value || headers().get('x-vercel-ip-country') || 'US').toUpperCase();
  const p = prices?.find((r: any) => r.country === wanted) ?? prices?.find((r: any) => r.country === '*');
  const country = prices?.some((r: any) => r.country === wanted) ? wanted : '*';
  const price = p ? new Intl.NumberFormat('en', {style: 'currency', currency: p.currency}).format(p.amount_cents / 100) : '';
  const {data: {user}} = await sb.auth.getUser();
  return (<div className="px-6 pt-14"><div className="text-xs tracking-[.2em] text-[#8A6A33]">BIBLESYN PREMIUM</div>
    <h1 className="mb-5 mt-2 font-serif text-4xl font-semibold leading-tight">One plan. The whole experience.</h1>
    <ul className="mb-5 space-y-2 text-sm">{FEATURES.map(f => <li key={f}>✓ {f}</li>)}</ul>
    <div className="flex items-center justify-between rounded-3xl border-2 border-gold bg-parchment p-5"><div><div className="text-sm font-semibold">Monthly</div><div className="text-xs text-[#6F5A40]">Cancel anytime</div></div><div className="font-serif text-4xl font-bold">{price}<span className="font-sans text-xs font-normal text-[#6F5A40]">/mo</span></div></div>
    <form method="get" className="mt-3 flex items-center gap-2 text-xs text-[#6F5A40]"><label>Price for <select name="country" defaultValue={country} className="rounded border border-[#D9C6A0] bg-[#FFFDF8] p-1">{prices?.map((r: any) => <option key={r.country} value={r.country}>{r.country === '*' ? 'Other countries' : r.country} ({r.currency})</option>)}</select></label><button className="underline">Update</button></form>
    {user ? <form action="/api/stripe/checkout" method="post" className="mt-5"><input type="hidden" name="country" value={country} /><button className="h-14 w-full rounded-full bg-brown font-semibold text-ivory">Subscribe · {price}/month</button></form>
      : <Link href="/signup?next=/premium" className="mt-5 block rounded-full bg-brown py-4 text-center font-semibold text-ivory">Create account to subscribe</Link>}
    <p className="mt-4 text-center text-[11px] text-[#6F5A40]">Secure payment with Stripe. Renews monthly until cancelled.</p></div>);
}