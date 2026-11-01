import Link from 'next/link';
import {Check, Library, Sparkles, CalendarCheck, Headphones, NotebookPen} from 'lucide-react';
import {getT} from '@/lib/i18n';
import {CHECKOUT_URL, PRICE} from '@/lib/offer';

export const metadata = {title: 'Premium'};
const FEATURES = [[Library, 'premium.f1'], [Sparkles, 'premium.f2'], [CalendarCheck, 'premium.f3'], [Headphones, 'premium.f4'], [NotebookPen, 'premium.f5']] as const;

export default async function Premium() {
  const t = await getT();
  return (<div className="px-6 pt-[52px]"><div className="font-serif text-sm font-bold uppercase tracking-[.2em] text-leaf">Biblesyn {t('premium.label')}</div>
    <h1 className="mb-[22px] mt-2 font-serif text-[38px] font-bold leading-[1.05]">{t('premium.title')}</h1>
    <ul className="mb-5 space-y-3">{FEATURES.map(([I, k]) => <li key={k} className="flex items-center gap-3 text-[15px]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-leafsoft text-leaf"><I size={16} /></span>{t(k)}<Check size={16} strokeWidth={2.4} className="ml-auto text-leaf" /></li>)}</ul>
    <div className="flex items-center justify-between rounded-3xl border-2 border-ink px-5 py-[18px]"><div><div className="whitespace-nowrap text-sm font-semibold">{t('premium.monthly')}</div><div className="whitespace-nowrap text-xs text-mute">{t('premium.cancel_anytime')}</div></div>
      <div className="whitespace-nowrap font-serif text-4xl font-bold">{PRICE.now}</div></div>
    <a href={CHECKOUT_URL} rel="noopener" className="btn-ink !mt-5 !h-14">{t('premium.subscribe', {price: PRICE.now})}</a>
    <p className="mt-3.5 text-center"><Link href="/" className="text-sm text-mute">{t('premium.not_now')}</Link></p>
  </div>);
}
