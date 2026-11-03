import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
import {getCountry, getCountryCookie, getLocale} from '@/lib/locale';
import {routing} from '@/i18n/routing';
import {buildOfferCheckoutUrl, getOffer, isCheckoutConfigured, resolveOfferCountry} from '@/lib/offer';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = typeof body.locale === 'string' && routing.locales.includes(body.locale as any) ? body.locale : await getLocale();
  const supabase = supabaseServer();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error: 'authentication_required'}, {status: 401});

  const {data: profile} = await supabase.from('profiles').select('country,email').eq('id', user.id).maybeSingle();
  const country = resolveOfferCountry(getCountryCookie() || getCountry() || 'US');
  const offer = getOffer(country);
  if (!isCheckoutConfigured(offer)) {
    return NextResponse.json({error: 'checkout_not_configured', country}, {status: 503});
  }

  // Attribution values are attached to the selected offer and retained by EscalePay.
  const customerEmail = user.email || profile?.email;
  const url = buildOfferCheckoutUrl(locale, country, user.id, customerEmail);
  return NextResponse.json({url});
}
