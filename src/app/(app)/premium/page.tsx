import Link from 'next/link';
import {Check, Library, Sparkles, CalendarCheck, Headphones, NotebookPen} from 'lucide-react';
import {supabaseServer} from '@/lib/supabase/server';
import {getCountry, getLocale} from '@/lib/locale';
import {getT} from '@/lib/i18n';
export const metadata = {title: 'Premium'};
const FEATURES = [[Library, 'premium.f1'], [Sparkles, 'premium.f2'], [CalendarCheck, 'premium.f3'], [Headphones, 'premium.f4'], [NotebookPen, 'premium.f5']] as const;
export default async function Premium() {
  const sb = supabaseServer(); const t = await getT(); const locale = await getLocale();
  const {data: {user}} = await sb.auth.getUser(); let country = getCountry();
  if (user) { const {data: p} = await sb.from('profiles').select('country').eq('id', user.id).maybeSingle(); if (p?.country) country = p.country; }
  const {data: rows} = await sb.from('prices').select('country,currency,amount_cents').eq('active', true).in('country', [country || '*', '*']);
  const p = rows?.find((r: any) => r.country === country) ?? rows?.find((r: any) => r.country === '*');
  const {data: c} = country ? await sb.from('countries').select('name').eq('code', country).maybeSingle() : {data: null};
  let price = ''; try { price = p ? new Intl.NumberFormat(locale, {style: 'currency', currency: p.currency}).format(p.amount_cents / 100) : ''; } catch { price = p ? `${(p.amount_cents / 100).toFixed(2)} ${p.currency}` : ''; }
  return (<div className="px-6 pt-[52px]"><div className="font-serif text-sm font-bold uppercase tracking-[.2em] text-leaf">Biblesyn {t('premium.label')}</div>
    <h1 className="mb-[22px] mt-2 font-serif text-[38px] font-bold leading-[1.05]">{t('premium.title')}</h1>
    <ul className="mb-5 space-y-3">{FEATURES.map(([I, k]) => <li key={k} className="flex items-center gap-3 text-[15px]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-leafsoft text-leaf"><I size={16} /></span>{t(k)}<Check size={16} strokeWidth={2.4} className="ml-auto text-leaf" /></li>)}</ul>
    <div className="flex items-center justify-between rounded-3xl border-2 border-ink px-5 py-[18px]"><div><div className="whitespace-nowrap text-sm font-semibold">{t('premium.monthly')}</div><div className="whitespace-nowrap text-xs text-mute">{t('premium.cancel_anytime')}</div></div>
      <div className="whitespace-nowrap font-serif text-4xl font-bold">{price}<span className="font-sans text-xs font-normal text-mute">{t('premium.per_month')}</span></div></div>
    <div className="mb-[18px] mt-2.5 px-1 text-xs text-mute">{t('premium.price_for', {country: c?.name ?? '—'})} · <Link href="/settings" className="font-semibold text-ink underline">{t('premium.change')}</Link></div>
    {user ? <form action="/api/stripe/checkout" method="post"><button className="btn-ink !h-14">{t('premium.subscribe', {price})}</button></form> : <Link href="/signup?next=/premium" className="btn-ink !h-14">{t('premium.create_to_subscribe')}</Link>}
    <p className="mt-3.5 text-center"><Link href="/" className="text-sm text-mute">{t('premium.not_now')}</Link></p><p className="mt-3 text-center text-[11px] text-mute">{t('premium.secure')}</p></div>);
}
