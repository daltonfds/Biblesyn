import {Link} from '@/i18n/navigation';
import {Check, Library, Sparkles, CalendarCheck, Headphones, NotebookPen} from 'lucide-react';
import {getT} from '@/lib/i18n';
import {getLocale, getCountry} from '@/lib/locale';
import {getOffer, isCheckoutConfigured} from '@/lib/offer';
import SubscriptionButton from '@/components/SubscriptionButton';
import {supabaseServer} from '@/lib/supabase/server';

export async function generateMetadata({params}: {params: {locale: string}}) {
  const {getStrings} = await import('@/lib/i18n');
  const strings = await getStrings(params.locale);
  return {title: strings['seo.premium'], description: strings['seo.description']};
}
const FEATURES = [[Library, 'premium.f1'], [Sparkles, 'premium.f2'], [CalendarCheck, 'premium.f3'], [Headphones, 'premium.f4'], [NotebookPen, 'premium.f5']] as const;

export default async function Premium() {
  const t = await getT();
  const locale = await getLocale();
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  let country = getCountry();
  if (!country && user) {
    const {data: profile} = await sb.from('profiles').select('country').eq('id', user.id).maybeSingle();
    country = profile?.country || 'US';
  }
  country = country || 'US';
  const offer = getOffer(country);
  const formattedPrice = new Intl.NumberFormat(locale, {style: 'currency', currency: offer.currency}).format(offer.price);
  const formattedOldPrice = new Intl.NumberFormat(locale, {style: 'currency', currency: offer.currency}).format(offer.oldPrice);
  const checkoutAvailable = isCheckoutConfigured(offer);

  return (<div className="px-6 pt-[52px]"><div className="font-serif text-sm font-bold uppercase tracking-[.2em] text-leaf">Biblesyn {t('premium.label')}</div>
    <h1 className="mb-[22px] mt-2 font-serif text-[38px] font-bold leading-[1.05]">{t('premium.title')}</h1>
    <ul className="mb-5 space-y-3">{FEATURES.map(([I, k]) => <li key={k} className="flex items-center gap-3 text-[15px]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-leafsoft text-leaf"><I size={16} /></span>{t(k)}<Check size={16} strokeWidth={2.4} className="ml-auto text-leaf" /></li>)}</ul>
    <div className="flex items-center justify-between rounded-3xl border-2 border-ink px-5 py-[18px]"><div><div className="whitespace-nowrap text-sm font-semibold">{t('premium.monthly')}</div><div className="whitespace-nowrap text-xs text-mute">{t('premium.cancel_anytime')}</div></div>
      <div className="text-right"><div className="whitespace-nowrap text-xs text-mute line-through">{formattedOldPrice}</div><div className="whitespace-nowrap font-serif text-4xl font-bold">{formattedPrice}</div></div></div>
    {checkoutAvailable ? <SubscriptionButton label={t('premium.subscribe', {price: formattedPrice})} /> :
      <div className="mt-5 rounded-2xl border border-line p-4 text-center text-sm text-mute" role="status">Checkout for {country} is not configured yet. Please check back soon.</div>}
    <p className="mt-3.5 text-center"><Link href="/home" className="text-sm text-mute">{t('premium.not_now')}</Link></p>
  </div>);
}
