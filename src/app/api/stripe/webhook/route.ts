import Stripe from 'stripe';
import {supabaseAdmin} from '@/lib/supabase/admin';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  let ev: Stripe.Event;
  try { ev = stripe.webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature')!, process.env.STRIPE_WEBHOOK_SECRET!); }
  catch { return new Response('bad signature', {status: 400}); }
  const db = supabaseAdmin();
  if (ev.type === 'checkout.session.completed') {
    const s = ev.data.object as Stripe.Checkout.Session;
    if (s.client_reference_id) await db.from('profiles').update({is_premium: true, stripe_customer_id: s.customer as string}).eq('id', s.client_reference_id);
  }
  if (ev.type === 'customer.subscription.deleted') {
    const s = ev.data.object as Stripe.Subscription;
    await db.from('profiles').update({is_premium: false}).eq('stripe_customer_id', s.customer as string);
  }
  return Response.json({ok: true});
}
