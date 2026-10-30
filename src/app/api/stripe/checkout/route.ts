import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
export async function POST(req: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser();
  if (!user) return NextResponse.redirect(`${site}/signup?next=/premium`, 303);
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email ?? undefined,
    client_reference_id: user.id,
    line_items: [{quantity: 1, price_data: {currency: 'usd', unit_amount: 100,
      recurring: {interval: 'month'}, product_data: {name: 'Biblesyn Premium'}}}],
    success_url: `${site}/?subscribed=1`,
    cancel_url: `${site}/premium`
  });
  return NextResponse.redirect(session.url!, 303);
}