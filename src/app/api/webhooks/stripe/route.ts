import Stripe from 'stripe';
import {NextRequest, NextResponse} from 'next/server';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {sendSubscriptionConfirmation} from '@/lib/email';

function periodEnd(subscription: Stripe.Subscription): number {
  const value = subscription as unknown as {current_period_end?: number; items?: {data?: Array<{current_period_end?: number}>}};
  return value.current_period_end ?? value.items?.data?.[0]?.current_period_end ?? Math.floor(Date.now() / 1000);
}
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !signingSecret) return NextResponse.json({error: 'stripe_webhook_not_configured'}, {status: 503});
  const signature = request.headers.get('stripe-signature');
  if (!signature) return NextResponse.json({error: 'missing_signature'}, {status: 400});
  const raw = await request.text();
  const stripe = new Stripe(secret);
  let event: Stripe.Event;
  try { event = stripe.webhooks.constructEvent(raw, signature, signingSecret); }
  catch { return NextResponse.json({error: 'invalid_signature'}, {status: 400}); }

  const db = supabaseAdmin();
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id || session.client_reference_id;
    const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
    if (session.mode === 'subscription' && userId && subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
      const {data: previous} = await db.from('subscriptions').select('id').eq('stripe_subscription_id', subscription.id).maybeSingle();
      const {error} = await db.from('subscriptions').upsert({
        user_id: userId, stripe_subscription_id: subscription.id, stripe_customer_id: customerId,
        status: subscription.status, currency: subscription.currency.toUpperCase(),
        amount_cents: session.amount_total ?? 0, country: session.metadata?.country ?? null,
        current_period_end: new Date(periodEnd(subscription) * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end, updated_at: new Date().toISOString(),
      }, {onConflict: 'stripe_subscription_id'});
      if (error) return NextResponse.json({error: 'subscription_persist_failed'}, {status: 500});
      await db.from('profiles').update({
        is_premium: ['active','trialing'].includes(subscription.status),
        premium_source: 'stripe', stripe_customer_id: customerId,
      }).eq('id', userId);
      const {data: profile} = await db.from('profiles').select('email,locale').eq('id', userId).maybeSingle();
      if (!previous && profile?.email) await sendSubscriptionConfirmation(profile.email, profile.locale);
    }
  }

  if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.paid') {
    const invoice = event.data.object as Stripe.Invoice & {subscription?: string | Stripe.Subscription};
    const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
    if (subscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      const userId = subscription.metadata?.user_id;
      if (userId) await db.from('payments').upsert({
        user_id: userId, stripe_invoice_id: invoice.id,
        currency: invoice.currency.toUpperCase(), amount_cents: invoice.amount_paid ?? 0,
        country: subscription.metadata?.country ?? null,
      }, {onConflict: 'stripe_invoice_id'});
    }
  }

  if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    const status = event.type === 'customer.subscription.deleted' ? 'canceled' : subscription.status;
    await db.from('subscriptions').update({
      status, current_period_end: new Date(periodEnd(subscription) * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end, updated_at: new Date().toISOString(),
    }).eq('stripe_subscription_id', subscription.id);
    const userId = subscription.metadata?.user_id;
    if (userId) await db.from('profiles').update({is_premium: ['active','trialing'].includes(status)}).eq('id', userId);
  }
  return NextResponse.json({received: true});
}
