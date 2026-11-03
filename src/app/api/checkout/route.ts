import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
import {getCountry} from '@/lib/locale';
import {routing} from '@/i18n/routing';
import {getOffer, isCheckoutConfigured} from '@/lib/offer';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = typeof body.locale === 'string' && routing.locales.includes(body.locale as any) ? body.locale : 'en';
  const supabase = supabaseServer();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error: 'authentication_required'}, {status: 401});

  const {data: profile} = await supabase.from('profiles').select('country,email').eq('id', user.id).maybeSingle();
  const country = (getCountry() || process.env.NEXT_COUNTRY || profile?.country || 'US').toUpperCase();
  const offer = getOffer(country);
  if (!isCheckoutConfigured(offer)) {
    return NextResponse.json({error: 'checkout_not_configured', country: OFFERS_COUNTRY(country)}, {status: 503});
  }

  // These are attribution hints only. The provider must preserve them in its signed webhook
  // for automatic account matching; never activate Premium from a browser redirect.
  const url = new URL(offer.checkoutUrl);
  url.searchParams.set('user_id', user.id);
  const customerEmail = user.email || profile?.email;
  if (customerEmail) url.searchParams.set('email', customerEmail);
  url.searchParams.set('locale', locale);
  url.searchParams.set('country', country);
  url.searchParams.set('external_reference', 'biblesyn_' + user.id);
  return NextResponse.json({url: url.toString()});
}

function OFFERS_COUNTRY(country: string) {
  return ['BR','US','PT','IT','ZA'].includes(country) ? country : 'US';
}
