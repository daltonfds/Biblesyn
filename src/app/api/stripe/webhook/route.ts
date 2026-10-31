import Stripe from 'stripe';
import {supabaseAdmin} from '@/lib/supabase/admin';
export const runtime = 'nodejs';
export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!); let ev: Stripe.Event;
  try { ev = stripe.webhooks.constructEvent(await req.text(), req.headers.get('stripe-signature')!, process.env.STRIPE_WEBHOOK_SECRET!); } catch { return new Response('bad signature', {status: 400}); }
  const db = supabaseAdmin();
  const sync = async (sub: Stripe.Subscription) => {
    const uid = sub.metadata?.user_id; if (!uid) return; const item = sub.items.data[0]; const active = ['active', 'trialing'].includes(sub.status);
    await db.from('subscriptions').upsert({user_id: uid, stripe_subscription_id: sub.id, stripe_customer_id: String(sub.customer), status: sub.status, currency: item?.price.currency, amount_cents: item?.price.unit_amount,
      country: sub.metadata?.country || null, current_period_end: new Date(sub.current_period_end * 1000).toISOString(), cancel_at_period_end: sub.cancel_at_period_end, updated_at: new Date().toISOString()}, {onConflict: 'stripe_subscription_id'});
    const {data: p} = await db.from('profiles').select('premium_source').eq('id', uid).maybeSingle();
    if (p?.premium_source !== 'admin') await db.from('profiles').update({is_premium: active, premium_source: active ? 'stripe' : null, stripe_customer_id: String(sub.customer)}).eq('id', uid);
  };
  if (ev.type === 'checkout.session.completed') { const s = ev.data.object as Stripe.Checkout.Session; if (s.subscription) await sync(await stripe.subscriptions.retrieve(String(s.subscription))); }
  else if (ev.type === 'customer.subscription.created' || ev.type === 'customer.subscription.updated' || ev.type === 'customer.subscription.deleted') await sync(ev.data.object as Stripe.Subscription);
  else if (ev.type === 'invoice.paid') {
    const i = ev.data.object as Stripe.Invoice;
    if (i.amount_paid > 0) {
      const sid = typeof i.subscription === 'string' ? i.subscription : i.subscription?.id; let s: any = null;
      if (sid) { s = (await db.from('subscriptions').select('user_id,country').eq('stripe_subscription_id', sid).maybeSingle()).data; if (!s) { await sync(await stripe.subscriptions.retrieve(sid)); s = (await db.from('subscriptions').select('user_id,country').eq('stripe_subscription_id', sid).maybeSingle()).data; } }
      await db.from('payments').upsert({stripe_invoice_id: i.id, user_id: s?.user_id ?? null, currency: i.currency, amount_cents: i.amount_paid, country: s?.country ?? null, paid_at: new Date((i.status_transitions?.paid_at ?? i.created) * 1000).toISOString()}, {onConflict: 'stripe_invoice_id'});
    }
  } else if (ev.type === 'charge.refunded') { const inv = (ev.data.object as any).invoice; if (inv) await db.from('payments').update({refunded: true}).eq('stripe_invoice_id', String(inv)); }
  return Response.json({ok: true});
}
