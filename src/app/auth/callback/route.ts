import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {supabaseServer} from '@/lib/supabase/server';
export async function GET(req: Request) {
  const u = new URL(req.url); const code = u.searchParams.get('code'); const next = u.searchParams.get('next') || '/';
  const res = NextResponse.redirect(new URL(next.startsWith('/') && !next.startsWith('//') ? next : '/', u.origin));
  if (code) {
    const sb = supabaseServer(); await sb.auth.exchangeCodeForSession(code);
    const {data: {user}} = await sb.auth.getUser(); const opt = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
    if (user) {
      const {data: p} = await sb.from('profiles').select('locale,country,font_family,font_size').eq('id', user.id).maybeSingle(); const c = cookies();
      const country = p?.country || c.get('country')?.value; const locale = p?.locale || c.get('locale')?.value; const upd: Record<string, string> = {};
      if (!p?.country && country) upd.country = country.toUpperCase(); if (!p?.locale && locale) upd.locale = locale;
      if (Object.keys(upd).length) await sb.from('profiles').update(upd).eq('id', user.id);
      if (p?.locale) res.cookies.set('locale', p.locale, opt); if (p?.country) res.cookies.set('country', p.country, opt);
      if (p) res.cookies.set('reader', JSON.stringify({f: p.font_family, s: p.font_size}), opt);
    }
  }
  return res;
}
