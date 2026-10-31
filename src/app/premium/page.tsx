import {cookies, headers} from 'next/headers';
import Link from 'next/link';
import {Check, Library, Sparkles, CalendarCheck, Headphones, NotebookPen} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
export const metadata = {title: 'Premium'};
const FEATURES = [[Library, 'Full Spiritual Library'], [Sparkles, 'Bible AI Assistant'], [CalendarCheck, 'All study plans'], [Headphones, 'Audio for every study'], [NotebookPen, 'Journal and growth dashboard']] as const;
export default async function Premium({searchParams}: {searchParams: {country?: string}}) {
  const sb = supabaseServer();
  const {data: prices} = await sb.from('prices').select('country,currency,amount_cents').eq('active', true).order('country');
  const wanted = (searchParams.country || cookies().get('country')?.value || headers().get('x-vercel-ip-country') || 'US').toUpperCase();
  const p = prices?.find((r: any) => r.country === wanted) ?? prices?.find((r: any) => r.country === '*');
  const country = prices?.some((r: any) => r.country === wanted) ? wanted : '*';
  const price = p ? new Intl.NumberFormat('en', {style: 'currency', currency: p.currency}).format(p.amount_cents / 100) : '';
  const {data: {user}} = await sb.auth.getUser();
  return (<div className="px-6 pt-12"><div className="font-serif text-sm font-bold tracking-[.2em] text-leaf">BIBLESYN PREMIUM</div>
    <h1 className="mb-6 mt-2 font-serif text-[38px] font-bold leading-[1.05]">One plan. The whole experience.</h1>
    <ul className="mb-6 space-y-3">{FEATURES.map(([I, f]) => <li key={f} className="flex items-center gap-3 text-[15px]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-leafsoft text-leaf"><I size={16} /></span>{f}<Check size={16} className="ml-auto text-leaf" /></li>)}</ul>
    <div className="flex items-center justify-between rounded-3xl border-2 border-ink p-5"><div><div className="text-sm font-semibold">Monthly</div><div className="text-xs text-mute">Cancel anytime</div></div>
      <div className="font-serif text-4xl font-bold">{price}<span className="font-sans text-xs font-normal text-mute">/mo</span></div></div>
    <form method="get" className="mt-3 flex items-center gap-2 text-xs text-mute"><label>Price for <select name="country" defaultValue={country} className="rounded-lg border border-line bg-white p-1.5 text-ink">{prices?.map((r: any) => <option key={r.country} value={r.country}>{r.country === '*' ? 'Other countries' : r.country} ({r.currency})</option>)}</select></label><button className="font-semibold underline">Update</button></form>
    {user ? <form action="/api/stripe/checkout" method="post" className="mt-5"><input type="hidden" name="country" value={country} /><button className="btn-ink !h-14">Subscribe · {price}/month</button></form>
      : <Link href="/signup?next=/premium" className="btn-ink mt-5 !h-14">Create account to subscribe</Link>}
    <p className="mt-3 text-center"><Link href="/" className="text-sm text-mute">Not now</Link></p>
    <p className="mt-3 text-center text-[11px] text-mute">Secure payment with Stripe. Renews monthly until cancelled.</p></div>);
}
