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

  const body = payload as Record<string, unknown>;
  const eventTypeValue = body.event_type ?? body.event ?? body.type;
  const eventType = typeof eventTypeValue === 'string' && eventTypeValue.trim()
    ? eventTypeValue.trim().slice(0, 120)
    : 'unknown';
  const providerIdValue = body.event_id ?? body.id;
  const providerEventId = typeof providerIdValue === 'string' || typeof providerIdValue === 'number'
    ? String(providerIdValue).slice(0, 200)
    : null;
  const eventHash = createHash('sha256').update(rawBody).digest('hex');

  const {error} = await supabaseAdmin()
    .from('escalepay_webhook_events')
    .insert({
      event_hash: eventHash,
      provider_event_id: providerEventId,
      event_type: eventType,
      payload: body,
      processing_status: 'received',
    });

  if (error) {
    // Unique-key conflicts mean the provider retried an event already stored.
    if (error.code === '23505') {
      return json({ok: true, received: true, duplicate: true});
    }
    console.error('EscalePay webhook persistence failed:', error.code || 'unknown');
    return json({ok: false, error: 'Could not persist webhook event'}, 500);
  }

  // Payment activation is deliberately not performed until the provider's
  // exact event and customer-identification payload contract is verified.
  return json({ok: true, received: true, processed: false});
}
