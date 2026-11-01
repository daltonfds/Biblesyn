import {createServerClient} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';

const COUNTRY_LOCALE: Record<string, string> = {
  MZ: 'pt', BR: 'pt', PT: 'pt', AO: 'pt', CV: 'pt', GW: 'pt', ST: 'pt', TL: 'pt',
  US: 'en', GB: 'en', IE: 'en', CA: 'en', AU: 'en', NZ: 'en', ZA: 'en',
  FR: 'fr', BE: 'fr', MC: 'fr', LU: 'fr', SN: 'fr', CI: 'fr', CD: 'fr', CG: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es', VE: 'es', UY: 'es',
};
const SUPPORTED_LOCALES = new Set(['en', 'pt', 'fr', 'es']);

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({request: req});
  const sb = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {getAll: () => req.cookies.getAll(), setAll(list: {name: string; value: string; options?: any}[]) {
      list.forEach(({name, value}) => req.cookies.set(name, value));
      res = NextResponse.next({request: req});
      list.forEach(({name, value, options}) => res.cookies.set(name, value, options));
    }},
  });
  const {data: {user}} = await sb.auth.getUser();
  if (!user && new RegExp('^/(journal|admin)').test(req.nextUrl.pathname)) {
    const u = req.nextUrl.clone(); u.pathname = '/login'; u.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(u);
  }

  const opt = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
  const country = (req.cookies.get('country')?.value || req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  if (!req.cookies.get('country') && country) res.cookies.set('country', country, opt);

  if (!req.cookies.get('locale')) {
    const browserLocale = req.headers.get('accept-language')?.split(',')[0]?.trim().toLowerCase().split(/[-_]/)[0];
    const locale = COUNTRY_LOCALE[country] || (browserLocale && SUPPORTED_LOCALES.has(browserLocale) ? browserLocale : 'en');
    res.cookies.set('locale', locale, opt);
  }
  return res;
}
export const config = {matcher: ['/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|api/webhooks/escalepay).*)']};
