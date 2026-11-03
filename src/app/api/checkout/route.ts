import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
import {getCountry, getCountryCookie, getLocale} from '@/lib/locale';
import {routing} from '@/i18n/routing';
import {buildOfferCheckoutUrl, getOffer, isCheckoutConfigured, resolveOfferCountry} from '@/lib/offer';

export const dynamic = 'force-dynamic';

function privateJson(body: unknown, status = 200) {
  const response = NextResponse.json(body, {status});
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  response.headers.set('Vary', 'Cookie, x-vercel-ip-country');
  return response;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = typeof body.locale === 'string' && routing.locales.includes(body.locale as any) ? body.locale : await getLocale();
  const supabase = supabaseServer();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) return privateJson({error: 'authentication_required'}, 401);

  const {data: profile} = await supabase.from('profiles').select('country,email').eq('id', user.id).maybeSingle();
  const country = resolveOfferCountry(getCountryCookie() || getCountry() || 'US');
  const offer = getOffer(country);
  if (!isCheckoutConfigured(offer)) {
    return privateJson({error: 'checkout_not_configured', country}, 503);
  }

  // Attribution values are attached to the selected offer and retained by EscalePay.
  const customerEmail = user.email || profile?.email;
  const url = buildOfferCheckoutUrl(locale, country, user.id, customerEmail);
  return privateJson({url});
}
