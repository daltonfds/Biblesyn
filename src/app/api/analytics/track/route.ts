import {NextRequest, NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
import {supabaseAdmin} from '@/lib/supabase/admin';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const clean = (value: unknown, max = 160) => typeof value === 'string' ? value.trim().slice(0, max) || null : null;
const decode = (value: string | null) => {
  if (!value) return null;
  try { return decodeURIComponent(value).slice(0, 100); } catch { return value.slice(0, 100); }
};

function classifyDevice(ua: string) {
  if (/ipad|tablet|kindle|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android/i.test(ua)) return 'mobile';
  if (ua) return 'desktop';
  return 'other';
}
function classifyBrowser(ua: string) {
  if (/edg\//i.test(ua)) return 'Edge';
  if (/opr\//i.test(ua)) return 'Opera';
  if (/firefox\//i.test(ua)) return 'Firefox';
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) return 'Chrome';
  if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) return 'Safari';
  return 'Other';
}
function classifyOS(ua: string) {
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os|macintosh/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'Other';
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (origin && host) {
    try { if (new URL(origin).host !== host) return NextResponse.json({ok: false}, {status: 403}); }
    catch { return NextResponse.json({ok: false}, {status: 403}); }
  }

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ok: false}, {status: 400}); }
  if (!UUID.test(String(body?.visitorId ?? '')) || !UUID.test(String(body?.sessionId ?? ''))) {
    return NextResponse.json({ok: false}, {status: 400});
  }
  const pagePath = clean(body?.pagePath, 500);
  if (!pagePath || !pagePath.startsWith('/') || pagePath.startsWith('//') || pagePath.startsWith('/admin') || pagePath.startsWith('/api')) {
    return NextResponse.json({ok: false}, {status: 400});
  }

  const ua = request.headers.get('user-agent') ?? '';
  const referrer = clean(body?.referrer, 1000);
  let referrerHost: string | null = null;
  if (referrer) {
    try {
      const parsed = new URL(referrer);
      if (parsed.host !== host) referrerHost = parsed.hostname.slice(0, 160);
    } catch {}
  }

  let userId: string | null = null;
  try {
    const {data: {user}} = await supabaseServer().auth.getUser();
    userId = user?.id ?? null;
  } catch {}

  const {error} = await supabaseAdmin().from('visitor_events').insert({
    visitor_id: body.visitorId,
    session_id: body.sessionId,
    user_id: userId,
    event_name: 'page_view',
    page_path: pagePath,
    page_title: clean(body?.pageTitle, 180),
    referrer_host: referrerHost,
    utm_source: clean(body?.utmSource, 120),
    utm_medium: clean(body?.utmMedium, 120),
    utm_campaign: clean(body?.utmCampaign, 160),
    country: clean(request.headers.get('x-vercel-ip-country'), 2)?.toUpperCase(),
    region: clean(request.headers.get('x-vercel-ip-country-region'), 100),
    city: decode(request.headers.get('x-vercel-ip-city')),
    device_type: classifyDevice(ua),
    browser: classifyBrowser(ua),
    operating_system: classifyOS(ua),
    is_new_visitor: body.isNewVisitor === true,
  });

  if (error) return NextResponse.json({ok: false}, {status: 500});
  return NextResponse.json({ok: true}, {status: 202});
}
