import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {supabaseServer} from '@/lib/supabase/server';
export async function POST(req: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin; const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser(); if (!user) return NextResponse.redirect(`${site}/signup?next=/premium`, 303);
  const {data: prof} = await sb.from('profiles').select('country').eq('id', user.id).maybeSingle();
  const country = (prof?.country || cookies().get('country')?.value || '*').toUpperCase();
  const {data: rows} = await sb.from('prices').select('country,currency,amount_cents').eq('active', true).in('country', [country, '*']);
  const p = rows?.find((r: any) => r.country === country) ?? rows?.find((r: any) => r.country === '*'); if (!p) return NextResponse.redirect(`${site}/premium`, 303);
  const meta = {user_id: user.id, country};
  const s = await new Stripe(process.env.STRIPE_SECRET_KEY!).checkout.sessions.create({mode: 'subscription', customer_email: user.email ?? undefined, client_reference_id: user.id, metadata: meta, subscription_data: {metadata: meta},
    line_items: [{quantity: 1, price_data: {currency: p.currency.toLowerCase(), unit_amount: p.amount_cents, recurring: {interval: 'month'}, product_data: {name: 'Biblesyn Premium'}}}], success_url: `${site}/?subscribed=1`, cancel_url: `${site}/premium`});
  return NextResponse.redirect(s.url!, 303);
}
