import {createHash, timingSafeEqual} from 'node:crypto';
import {NextRequest, NextResponse} from 'next/server';
import {supabaseAdmin} from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 256 * 1024;

function json(data: Record<string, unknown>, status = 200) {
  return NextResponse.json(data, {status});
}

function secureSecretMatches(received: string | null, expected: string) {
  if (!received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export async function GET() {
  return json({ok: true, service: 'escalepay-webhook', accepts: 'POST'});
}

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.ESCALEPAY_WEBHOOK_SECRET;
  if (!expectedSecret) {
    return json({ok: false, error: 'Webhook secret is not configured'}, 503);
  }

  if (!secureSecretMatches(request.headers.get('x-webhook-secret'), expectedSecret)) {
    return json({ok: false, error: 'Unauthorized'}, 401);
  }

  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return json({ok: false, error: 'Payload too large'}, 413);
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_BODY_BYTES) {
    return json({ok: false, error: 'Payload too large'}, 413);
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return json({ok: false, error: 'Invalid JSON payload'}, 400);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return json({ok: false, error: 'Expected a JSON object'}, 400);
  }

  const body = asObject(payload);
  const eventTypeValue = body.event_type ?? body.event ?? body.type;
  const eventType = typeof eventTypeValue === 'string' && eventTypeValue.trim()
    ? eventTypeValue.trim().slice(0, 120)
    : 'unknown';
  const providerIdValue = body.webhook_id ?? body.event_id ?? body.id;
  const providerEventId = typeof providerIdValue === 'string' || typeof providerIdValue === 'number'
    ? String(providerIdValue).slice(0, 200)
    : null;
  const eventHash = createHash('sha256').update(rawBody).digest('hex');
  const db = supabaseAdmin();

  const {error: insertError} = await db
    .from('escalepay_webhook_events')
    .insert({
      event_hash: eventHash,
      provider_event_id: providerEventId,
      event_type: eventType,
      payload: body,
      processing_status: 'received',
    });

  let storedEvent: {event_hash: string; processing_status: string} | null = null;

  if (insertError) {
    if (insertError.code !== '23505') {
      console.error('EscalePay webhook persistence failed:', insertError.code || 'unknown');
      return json({ok: false, error: 'Could not persist webhook event'}, 500);
    }

    const byHash = await db
      .from('escalepay_webhook_events')
      .select('event_hash, processing_status')
      .eq('event_hash', eventHash)
      .maybeSingle();

    storedEvent = byHash.data;

    if (!storedEvent && providerEventId) {
      const byProviderId = await db
        .from('escalepay_webhook_events')
        .select('event_hash, processing_status')
        .eq('provider_event_id', providerEventId)
        .maybeSingle();
      storedEvent = byProviderId.data;
    }

    if (!storedEvent) {
      return json({ok: false, error: 'Could not locate duplicate webhook event'}, 500);
    }

    if (storedEvent.processing_status === 'processed' || storedEvent.processing_status === 'ignored') {
      return json({ok: true, received: true, duplicate: true});
    }
  } else {
    storedEvent = {event_hash: eventHash, processing_status: 'received'};
  }

  if (eventType !== 'payment_confirmed') {
    return json({ok: true, received: true, processed: false, event: eventType});
  }

  const payment = asObject(body.payment);
  const product = asObject(body.product);
  const customer = asObject(body.customer);
  const productIdValue = product.id ?? body.product_id;
  const amountValue = payment.amount ?? body.amount;
  const amount = typeof amountValue === 'number' || typeof amountValue === 'string'
    ? Number(amountValue)
    : Number.NaN;
  const currencyValue = payment.currency ?? body.currency;
  const orderIdValue = body.order_id ?? body.orderId;
  const emailValue = customer.email ?? body.customer_email;
  const productId = typeof productIdValue === 'string' || typeof productIdValue === 'number'
    ? String(productIdValue)
    : '';
  const currency = typeof currencyValue === 'string' ? currencyValue.toUpperCase() : '';
  const orderId = typeof orderIdValue === 'string' || typeof orderIdValue === 'number'
    ? String(orderIdValue)
    : '';
  const email = typeof emailValue === 'string' ? emailValue.trim().toLowerCase() : '';

  const {data, error: processError} = await db.rpc('process_escalepay_payment', {
    p_event_hash: storedEvent.event_hash,
    p_order_id: orderId,
    p_product_id: productId,
    p_email: email,
    p_amount: amount,
    p_currency: currency,
    p_is_test: body.test === true,
  });

  if (processError) {
    await db
      .from('escalepay_webhook_events')
      .update({processing_status: 'failed', processing_error: processError.code || 'Payment processing failed'})
      .eq('event_hash', storedEvent.event_hash);
    console.error('EscalePay payment processing failed:', processError.code || 'unknown');
    return json({ok: false, error: 'Payment could not be processed'}, 500);
  }

  const result = asObject(data);
  return json({
    ok: true,
    received: true,
    processed: result.status === 'processed',
    status: result.status ?? 'unknown',
    reason: result.reason,
    duplicate: result.duplicate_order === true,
  });
}
