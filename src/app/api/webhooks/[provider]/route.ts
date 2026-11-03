import {createHash, createHmac, timingSafeEqual} from 'node:crypto';
import {NextRequest, NextResponse} from 'next/server';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {sendSubscriptionConfirmation} from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => v && typeof v === 'object' && !Array.isArray(v) ? v as Obj : {};
const str = (...values: unknown[]) => {
  const value = values.find(v => typeof v === 'string' || typeof v === 'number');
  return value === undefined ? '' : String(value).trim();
};
const norm = (value: string) => value.toLowerCase().replace(/[.\s-]+/g, '_');

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a), bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function validSignature(request: NextRequest, raw: string, secret: string) {
  const staticSecret = request.headers.get('x-webhook-secret') || request.headers.get('x-escalepay-secret');
  if (staticSecret && safeEqual(staticSecret, secret)) return true;
  const signature = request.headers.get('x-escalepay-signature') || request.headers.get('x-signature') || '';
  const received = signature.replace(/^sha256=/i, '');
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  return Boolean(received) && safeEqual(received, expected);
}

function eventAction(event: string, status: string): 'activate' | 'revoke' | 'ignore' {
  const value = norm(event + '_' + status);
  if (/refund|reembolso|estorno|chargeback|dispute|cancel|cancelad[oa]s?|cancell?ed|expired|revok|failed|refused|rejected|past_due/.test(value)) return 'revoke';
  if (/payment_confirmed|payment_paid|payment_approved|paid|approved|confirmed|completed|subscription_active|subscription_renewed|renewed|renovad[oa]s?|reativada|activated|ativada/.test(value)) return 'activate';
  return 'ignore';
}

export async function GET(_: NextRequest, context: {params: {provider: string}}) {
  return NextResponse.json({ok: true, provider: context.params.provider, accepts: 'POST'});
}

export async function POST(request: NextRequest, context: {params: {provider: string}}) {
  const provider = context.params.provider.toLowerCase();
  if (provider !== 'escalepay') {
    return NextResponse.json({ok: false, error: 'provider_not_configured'}, {status: 501});
  }
  const secret = process.env.ESCALEPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ok: false, error: 'webhook_secret_not_configured'}, {status: 503});

  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > 256 * 1024) return NextResponse.json({error: 'payload_too_large'}, {status: 413});
  if (!validSignature(request, raw, secret)) return NextResponse.json({error: 'invalid_signature'}, {status: 401});

  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { return NextResponse.json({error: 'invalid_json'}, {status: 400}); }
  const body = obj(parsed);
  const data = obj(body.data ?? body.payment ?? body);
  const buyer = obj(data.buyer ?? data.customer ?? body.customer);
  const metadata = obj(data.metadata ?? body.metadata);
  const event = str(request.headers.get('x-escalepay-event'), body.event_type, body.event, body.type, data.event_type);
  const status = str(data.status, body.status, body.payment_status, event);
  const action = eventAction(event, status);
  const orderId = str(data.order_id, data.orderId, data.transaction_id, data.payment_id, data.id, body.order_id, body.orderId);
  const email = str(buyer.email, data.customer_email, data.email, body.customer_email, body.email).toLowerCase();
  const externalReference = str(data.external_reference, data.externalReference, body.external_reference);
  const explicitUserId = str(metadata.user_id, data.user_id, body.user_id);
  const refUserId = externalReference.match(/^biblesyn_([0-9a-f-]{36})$/i)?.[1] || '';
  const userId = explicitUserId || refUserId;
  const currency = str(data.currency, body.currency).toUpperCase();
  const country = str(metadata.country, data.country, body.country).toUpperCase();
  const amountRaw = data.amount_cents ?? data.amount ?? body.amount_cents ?? body.amount;
  const amount = Number(amountRaw);
  const amountCents = Number.isFinite(amount) ? (data.amount_cents !== undefined ? Math.round(amount) : Math.round(amount * 100)) : null;
  const deliveryId = str(request.headers.get('x-webhook-id'), request.headers.get('x-escalepay-delivery'), body.webhook_id, body.event_id, body.id);
  const eventHash = createHash('sha256').update(raw).digest('hex');
  const eventId = deliveryId || eventHash;
  const db = supabaseAdmin();

  const {error: logError} = await db.from('payment_webhook_events').insert({
    provider, provider_event_id: eventId, event_type: event || status || 'unknown',
    order_id: orderId || null, payload: body, processing_status: 'received', event_hash: eventHash,
  });
  if (logError) {
    if (logError.code !== '23505') {
      console.error('Payment webhook log insert failed:', logError.code);
      return NextResponse.json({error: 'event_log_failed'}, {status: 500});
    }
    let existing = await db.from('payment_webhook_events').select('processing_status').eq('provider', provider).eq('provider_event_id', eventId).maybeSingle();
    if (!existing.data) existing = await db.from('payment_webhook_events').select('processing_status').eq('provider', provider).eq('event_hash', eventHash).maybeSingle();
    if (!existing.data) return NextResponse.json({error: 'duplicate_event_lookup_failed'}, {status: 500});
    if (existing.data.processing_status === 'processed' || existing.data.processing_status === 'ignored') {
      return NextResponse.json({ok: true, duplicate: true});
    }
    await db.from('payment_webhook_events').update({processing_status: 'received', processing_error: null})
      .eq('provider', provider).eq('provider_event_id', eventId);
  }

  if (action === 'ignore') {
    await db.from('payment_webhook_events').update({processing_status: 'ignored'}).eq('provider', provider).eq('provider_event_id', eventId);
    return NextResponse.json({ok: true, processed: false, action: 'ignore'});
  }

  try {
    let profileQuery = db.from('profiles').select('id,email,locale,country,is_premium,premium_expires_at,premium_order_id');
    if (userId) profileQuery = profileQuery.eq('id', userId);
    else if (email) profileQuery = profileQuery.ilike('email', email);
    else throw new Error('buyer_reference_missing');
    const {data: profile, error: profileError} = await profileQuery.maybeSingle();
    if (profileError || !profile) throw new Error('buyer_not_found');

    if (action === 'activate') {
      if (!orderId) throw new Error('order_id_missing');
      const {data: priorPayment} = await db.from('payment_transactions').select('refunded,status')
        .eq('provider', provider).eq('provider_order_id', orderId).maybeSingle();
      if (priorPayment?.refunded || ['refunded','canceled','chargeback'].includes(priorPayment?.status ?? '')) {
        await db.from('payment_webhook_events').update({processing_status: 'ignored', user_id: profile.id})
          .eq('provider', provider).eq('provider_event_id', eventId);
        return NextResponse.json({ok: true, processed: false, reason: 'order_already_refunded'});
      }
      const now = new Date();
      const {error: ledgerError} = await db.from('payment_transactions').upsert({
        provider, provider_order_id: orderId, user_id: profile.id,
        country: country || profile.country || null, currency: currency || null,
        amount_cents: amountCents, status: 'paid', refunded: false, paid_at: now.toISOString(), updated_at: now.toISOString(),
      }, {onConflict: 'provider,provider_order_id'});
      if (ledgerError) throw new Error('payment_ledger_write_failed');
      if (profile.premium_order_id === orderId && profile.is_premium) {
        await db.from('payment_webhook_events').update({processing_status: 'processed', user_id: profile.id})
          .eq('provider', provider).eq('provider_event_id', eventId);
        return NextResponse.json({ok: true, processed: true, duplicateOrder: true});
      }
      const previousEnd = profile.premium_expires_at ? new Date(profile.premium_expires_at) : now;
      const base = previousEnd > now ? previousEnd : now;
      const expiry = new Date(base.getTime() + 30 * 24 * 60 * 60 * 1000);
      const {error} = await db.from('profiles').update({
        is_premium: true, premium_expires_at: expiry.toISOString(), premium_status: 'active',
        premium_country: country || profile.country || null, premium_currency: currency || null,
        premium_provider: provider, premium_order_id: orderId, premium_source: provider,
      }).eq('id', profile.id);
      if (error) throw new Error('profile_activation_failed');
      await db.from('payment_webhook_events').update({processing_status: 'processed', user_id: profile.id}).eq('provider', provider).eq('provider_event_id', eventId);
      if (profile.email || email) await sendSubscriptionConfirmation(profile.email || email, profile.locale);
      return NextResponse.json({ok: true, processed: true, action, orderId});
    }

    if (action === 'revoke') {
      const {error} = await db.from('profiles').update({
        is_premium: false, premium_status: norm(event + '_' + status).slice(0, 80),
        premium_provider: provider, premium_order_id: orderId || null,
      }).eq('id', profile.id);
      if (error) throw new Error('profile_revocation_failed');
      if (orderId) {
        const isRefund = /refund|reembolso|estorno|chargeback|dispute/.test(norm(event + '_' + status));
        await db.from('payment_transactions').update({status: isRefund ? 'refunded' : 'canceled', refunded: isRefund, updated_at: new Date().toISOString()})
          .eq('provider', provider).eq('provider_order_id', orderId);
      }
      await db.from('payment_webhook_events').update({processing_status: 'processed', user_id: profile.id}).eq('provider', provider).eq('provider_event_id', eventId);
      return NextResponse.json({ok: true, processed: true, action, orderId});
    }

    await db.from('payment_webhook_events').update({processing_status: 'ignored', user_id: profile.id}).eq('provider', provider).eq('provider_event_id', eventId);
    return NextResponse.json({ok: true, processed: false, action: 'ignore'});
  } catch (error) {
    const message = error instanceof Error ? error.message : 'processing_failed';
    await db.from('payment_webhook_events').update({processing_status: 'failed', processing_error: message.slice(0, 180)}).eq('provider', provider).eq('provider_event_id', eventId);
    console.error('Payment webhook processing failed:', message);
    return NextResponse.json({ok: false, error: message}, {status: 500});
  }
}
