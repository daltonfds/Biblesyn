import createMiddleware from 'next-intl/middleware';
import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';
import {routing} from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);
const SUPPORTED = new Set<string>(routing.locales);

const COUNTRY_LOCALE: Record<string, string> = {
  BR: 'pt-BR',
  PT: 'pt-PT', AO: 'pt-PT', MZ: 'pt-PT', CV: 'pt-PT',
  FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr',
  ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
  IT: 'it', SM: 'it', VA: 'it',
  ZA: 'en-ZA',
  US: 'en', GB: 'en', CA: 'en', AU: 'en',
};

function acceptLanguageLocale(header: string | null): string | null {
  if (!header) return null;
  const candidates = header.split(',').map((part, index) => {
    const [tag, ...params] = part.trim().split(';');
    const q = Number(params.find(p => p.trim().startsWith('q='))?.trim().slice(2) ?? 1);
    return {tag: tag.replace('_', '-').toLowerCase(), q, index};
  }).filter(x => x.q > 0).sort((a, b) => b.q - a.q || a.index - b.index);

  for (const candidate of candidates) {
    const exact = routing.locales.find(locale => locale.toLowerCase() === candidate.tag);
    if (exact) return exact;
    const language = candidate.tag.split('-')[0];
    const regional = routing.locales.find(locale => locale.toLowerCase().startsWith(language + '-'));
    if (regional) return regional;
    if (SUPPORTED.has(language)) return language;
  }
  return null;
}

function detectLocale(req: NextRequest): string {
  const manual = req.cookies.get('NEXT_LOCALE')?.value;
  if (manual && SUPPORTED.has(manual)) return manual;
  const country = (req.headers.get('x-vercel-ip-country') || '').toUpperCase();
  return COUNTRY_LOCALE[country] || acceptLanguageLocale(req.headers.get('accept-language')) || 'en';
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) return NextResponse.next();

  const locale = detectLocale(req);
  const firstSegment = pathname.split('/')[1];
  if (SUPPORTED.has(firstSegment) && firstSegment !== locale) {
    const target = req.nextUrl.clone();
    target.pathname = pathname.replace(new RegExp('^/' + firstSegment + '(?=/|$)'), '/' + locale);
    return NextResponse.redirect(target);
  }

  req.headers.set('x-biblesyn-path', pathname);
  if (!req.cookies.get('NEXT_LOCALE')) req.cookies.set('NEXT_LOCALE', locale);

  const intlResponse = handleI18nRouting(req);
  const cookieOptions = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
  intlResponse.cookies.set('NEXT_LOCALE', locale, cookieOptions);
  const detectedCountry = req.headers.get('x-vercel-ip-country')?.toUpperCase();
  if (detectedCountry && !req.cookies.get('country')) {
    intlResponse.cookies.set('country', detectedCountry, cookieOptions);
  }

  if (/^\/[a-zA-Z-]+\/auth\/callback(?:\/|$)/.test(pathname)) return intlResponse;

  let authResponse = NextResponse.next({request: req});
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll(items: {name: string; value: string; options: CookieOptions}[]) {
          items.forEach(({name, value}) => req.cookies.set(name, value));
          authResponse = NextResponse.next({request: req});
          items.forEach(({name, value, options}) => authResponse.cookies.set(name, value, options));
        },
      },
    },
  );
  const {data: {user}} = await supabase.auth.getUser();
  const localizedPath = pathname.replace(/^\/[a-zA-Z-]+(?=\/|$)/, '') || '/';
  if (!user && (/^\/journal(?:\/|$)/.test(localizedPath) || /^\/admin(?:\/|$)/.test(localizedPath))) {
    const target = req.nextUrl.clone();
    target.pathname = '/' + locale + '/login';
    target.searchParams.set('next', pathname + req.nextUrl.search);
    return NextResponse.redirect(target);
  }

  authResponse.cookies.getAll().forEach(cookie => intlResponse.cookies.set(cookie));
  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
