import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
import {FONTS} from '@/lib/locale';
import {routing} from '@/i18n/routing';

export async function POST(req: Request) {
  const sb = supabaseServer();
  const body = await req.json().catch(() => ({}));
  const {data: {user}} = await sb.auth.getUser();
  const res = NextResponse.json({ok: true});
  const opt = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
  const cookieHeader = req.headers.get('cookie') || '';
  const readCookie = (name: string) => decodeURIComponent(cookieHeader.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))?.[1] ?? '');
  const cur = (() => { try { return JSON.parse(readCookie('reader') || '{}'); } catch { return {}; } })();

  if (body.sync && user) {
    const {data: p} = await sb.from('profiles').select('locale,font_family,font_size').eq('id', user.id).maybeSingle();
    const selectedLocale = typeof body.locale === 'string' && routing.locales.includes(body.locale as any)
      ? body.locale
      : readCookie('NEXT_LOCALE') || readCookie('locale') || p?.locale || 'en';
    const selectedCountry = (req.headers.get('x-vercel-ip-country') || (process.env.VERCEL_ENV !== 'production' ? readCookie('NEXT_COUNTRY') || readCookie('country') : '') || '').toUpperCase();
    if (routing.locales.includes(selectedLocale as any)) {
      res.cookies.set('locale', selectedLocale, opt);
      res.cookies.set('NEXT_LOCALE', selectedLocale, opt);
    }
    if (/^[A-Z]{2}$/.test(selectedCountry)) {
      res.cookies.set('country', selectedCountry, opt);
      res.cookies.set('NEXT_COUNTRY', selectedCountry, opt);
    }
    if (p) res.cookies.set('reader', JSON.stringify({f: p.font_family, s: p.font_size}), opt);
    if (user && selectedLocale !== p?.locale) await sb.from('profiles').update({locale: selectedLocale}).eq('id', user.id);
    return res;
  }

  const upd: Record<string, any> = {};
  if (typeof body.locale === 'string' && routing.locales.includes(body.locale as (typeof routing.locales)[number])) {
    res.cookies.set('locale', body.locale, opt);
    res.cookies.set('NEXT_LOCALE', body.locale, opt);
    upd.locale = body.locale;
  }
  if (body.font || body.size) {
    const f = (FONTS as readonly string[]).includes(body.font) ? body.font : cur.f ?? 'serif';
    const s = Math.min(28, Math.max(15, Number(body.size) || cur.s || 19));
    res.cookies.set('reader', JSON.stringify({f, s}), opt);
    upd.font_family = f;
    upd.font_size = s;
  }
  if (user && Object.keys(upd).length) await sb.from('profiles').update(upd).eq('id', user.id);
  return res;
}
