import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
export async function POST(req: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/signup?next=/premium`, 303);
  const country = String((await req.formData()).get('country') ?? '*').toUpperCase();
  const {data: rows} = await sb.from('prices').select('country,currency,amount_cents').eq('active', true).in('country', [country, '*']);
  const p = rows?.find((r: any) => r.country === country) ?? rows?.find((r: any) => r.country === '*');
  if (!p) return NextResponse.redirect(`${site}/premium`, 303);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const s = await stripe.checkout.sessions.create({mode: 'subscription', customer_email: user.email ?? undefined, client_reference_id: user.id,
    line_items: [{quantity: 1, price_data: {currency: p.currency.toLowerCase(), unit_amount: p.amount_cents, recurring: {interval: 'month'}, product_data: {name: 'Biblesyn Premium'}}}],
    success_url: `${site}/?subscribed=1`, cancel_url: `${site}/premium`});
  return NextResponse.redirect(s.url!, 303);
}