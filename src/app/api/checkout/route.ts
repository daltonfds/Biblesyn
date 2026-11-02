import {NextResponse} from 'next/server';
import Stripe from 'stripe';
import {supabaseServer} from '@/lib/supabase/server';
import {getBillingPrice} from '@/lib/offer';
import {getCountry} from '@/lib/locale';
import {routing} from '@/i18n/routing';

const STRIPE_LOCALE: Record<string, Stripe.Checkout.SessionCreateParams.Locale> = {
  en: 'en', 'en-ZA': 'en', 'pt-BR': 'pt-BR', 'pt-PT': 'pt', fr: 'fr', es: 'es', it: 'it',
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const locale = typeof body.locale === 'string' && routing.locales.includes(body.locale as any) ? body.locale : 'en';
  const supabase = supabaseServer();
  const {data: {user}} = await supabase.auth.getUser();
  if (!user) return NextResponse.json({error: 'authentication_required'}, {status: 401});
  const {data: profile} = await supabase.from('profiles').select('country').eq('id', user.id).maybeSingle();
  const country = (typeof body.country === 'string' ? body.country : getCountry() || profile?.country || '').toUpperCase();

  if (locale === 'pt-BR') {
    if (country !== 'BR') return NextResponse.json({error: 'escalepay_available_in_brazil_only'}, {status: 403});
    return NextResponse.json({url: process.env.NEXT_PUBLIC_CHECKOUT_URL || 'https://checkout.escalepay.com/9630961'});
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return NextResponse.json({error: 'stripe_not_configured'}, {status: 503});
  const price = await getBillingPrice(locale, country);
  if (!price) return NextResponse.json({error: 'price_not_configured', country, locale}, {status: 503});

  const stripe = new Stripe(secret);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blui.online';
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    locale: STRIPE_LOCALE[locale] || 'en',
    customer_email: user.email || undefined,
    client_reference_id: user.id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: price.currency.toLowerCase(),
        unit_amount: price.amountCents,
        recurring: {interval: 'month'},
        product_data: {name: 'Biblesyn Premium', description: 'Monthly access to the Biblesyn platform'},
      },
    }],
    metadata: {user_id: user.id, locale, country: price.country},
    subscription_data: {metadata: {user_id: user.id, locale, country: price.country}},
    success_url: `${siteUrl}/${locale}/premium?checkout=success`,
    cancel_url: `${siteUrl}/${locale}/premium?checkout=cancelled`,
  });
  return NextResponse.json({url: session.url});
}
