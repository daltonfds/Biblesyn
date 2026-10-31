import {NextResponse} from 'next/server';
import {supabaseServer} from '@/lib/supabase/server';
import {FONTS} from '@/lib/locale';
export async function POST(req: Request) {
  const sb = supabaseServer(); const body = await req.json().catch(() => ({}));
  const {data: {user}} = await sb.auth.getUser();
  const res = NextResponse.json({ok: true}); const opt = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
  const cur = (() => { try { return JSON.parse(decodeURIComponent(req.headers.get('cookie')?.match(/(?:^|; )reader=([^;]*)/)?.[1] ?? '{}')); } catch { return {}; } })();
  if (body.sync && user) {
    const {data: p} = await sb.from('profiles').select('locale,country,font_family,font_size').eq('id', user.id).maybeSingle();
    if (p?.locale) res.cookies.set('locale', p.locale, opt);
    if (p?.country) res.cookies.set('country', p.country, opt);
    if (p) res.cookies.set('reader', JSON.stringify({f: p.font_family, s: p.font_size}), opt);
    return res;
  }
  const upd: Record<string, any> = {};
  if (typeof body.locale === 'string') { const {data} = await sb.from('languages').select('code').eq('code', body.locale).eq('active', true).maybeSingle(); if (data) { res.cookies.set('locale', body.locale, opt); upd.locale = body.locale; } }
  if (typeof body.country === 'string') { const {data} = await sb.from('countries').select('code').eq('code', body.country.toUpperCase()).eq('active', true).maybeSingle(); if (data) { res.cookies.set('country', data.code, opt); upd.country = data.code; } }
  if (body.font || body.size) {
    const f = (FONTS as readonly string[]).includes(body.font) ? body.font : cur.f ?? 'serif'; const s = Math.min(28, Math.max(15, Number(body.size) || cur.s || 19));
    res.cookies.set('reader', JSON.stringify({f, s}), opt); upd.font_family = f; upd.font_size = s;
  }
  if (user && Object.keys(upd).length) await sb.from('profiles').update(upd).eq('id', user.id);
  return res;
}
