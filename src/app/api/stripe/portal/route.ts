import Stripe from 'stripe';
import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
export async function POST(req: Request) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin; const sb = supabaseServer();
  const {data: {user}} = await sb.auth.getUser(); if (!user) return NextResponse.redirect(`${site}/login`, 303);
  const {data: p} = await sb.from('profiles').select('stripe_customer_id').eq('id', user.id).maybeSingle(); if (!p?.stripe_customer_id) return NextResponse.redirect(`${site}/settings`, 303);
  const s = await new Stripe(process.env.STRIPE_SECRET_KEY!).billingPortal.sessions.create({customer: p.stripe_customer_id, return_url: `${site}/settings`});
  return NextResponse.redirect(s.url, 303);
}
