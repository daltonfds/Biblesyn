import createMiddleware from 'next-intl/middleware';
import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';
import {routing} from './i18n/routing';
import {resolveRequestContext} from './lib/request-context';

const handleI18nRouting = createMiddleware(routing);

function privateCache(response: NextResponse) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
  response.headers.set('Vary', 'Cookie, Accept-Language, x-vercel-ip-country');
  return response;
}

const SUPPORTED = new Set<string>(routing.locales);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  if (pathname.startsWith('/api/')) {
    const devOverride = process.env.VERCEL_ENV !== 'production';
    const context = resolveRequestContext({
      ipCountry: req.headers.get('x-vercel-ip-country'),
      overrideCountry: devOverride ? req.nextUrl.searchParams.get('country') : null,
      cookieCountry: devOverride ? (req.cookies.get('NEXT_COUNTRY')?.value || req.cookies.get('country')?.value) : null,
      environment: process.env.VERCEL_ENV,
    });
    const response = NextResponse.next();
    const options = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
    if (context.country) {
      response.cookies.set('NEXT_COUNTRY', context.country, options);
      response.cookies.set('country', context.country, options);
    } else {
      response.cookies.delete('NEXT_COUNTRY');
      response.cookies.delete('country');
    }
    return privateCache(response);
  }
  if (pathname.startsWith('/_next/')) return NextResponse.next();

  const ipCountry = req.headers.get('x-vercel-ip-country');
  const devOverride = process.env.VERCEL_ENV !== 'production';
  const context = resolveRequestContext({
    ipCountry,
    manualLocale: req.cookies.get('NEXT_LOCALE')?.value,
    acceptLanguage: req.headers.get('accept-language'),
    overrideCountry: devOverride ? req.nextUrl.searchParams.get('country') : null,
    cookieCountry: devOverride ? (req.cookies.get('NEXT_COUNTRY')?.value || req.cookies.get('country')?.value) : null,
    environment: process.env.VERCEL_ENV,
  });
  const locale = context.locale;
  // Mutate the request cookie jar too, so Server Components in this same
  // request see the IP country rather than the browser's previous country.
  if (context.country) {
    req.cookies.set('NEXT_COUNTRY', context.country);
    req.cookies.set('country', context.country);
  } else {
    req.cookies.delete('NEXT_COUNTRY');
    req.cookies.delete('country');
  }
  const firstSegment = pathname.split('/')[1];
  if (SUPPORTED.has(firstSegment) && firstSegment !== locale) {
    const target = req.nextUrl.clone();
    target.pathname = pathname.replace(new RegExp('^/' + firstSegment + '(?=/|$)'), '/' + locale);
    const redirect = NextResponse.redirect(target);
    const options = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
    if (context.country) {
      redirect.cookies.set('NEXT_COUNTRY', context.country, options);
      redirect.cookies.set('country', context.country, options);
    } else {
      redirect.cookies.delete('NEXT_COUNTRY');
      redirect.cookies.delete('country');
    }
    redirect.cookies.set('NEXT_LOCALE', locale, options);
    return privateCache(redirect);
  }

  req.headers.set('x-biblesyn-path', pathname);
  req.cookies.set('NEXT_LOCALE', locale);

  const intlResponse = handleI18nRouting(req);
  const cookieOptions = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
  intlResponse.cookies.set('NEXT_LOCALE', locale, cookieOptions);
  if (context.country) {
    intlResponse.cookies.set('NEXT_COUNTRY', context.country, cookieOptions);
    intlResponse.cookies.set('country', context.country, cookieOptions);
  } else {
    // A missing IP header must never leave a stale production country cookie behind.
    intlResponse.cookies.delete('NEXT_COUNTRY');
    intlResponse.cookies.delete('country');
  }

  if (/^\/[a-zA-Z-]+\/auth\/callback(?:\/|$)/.test(pathname)) return privateCache(intlResponse);

  // Public pages must remain available even if Preview/Edge auth configuration
  // is incomplete or Supabase session validation is temporarily unavailable.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return privateCache(intlResponse);

  let authResponse = NextResponse.next({request: req});
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll(items: {name: string; value: string; options: CookieOptions}[]) {
          items.forEach(({name, value}) => req.cookies.set(name, value));
          authResponse = NextResponse.next({request: req});
          items.forEach(({name, value, options}) => authResponse.cookies.set(name, value, options));
        },
      },
    });
    const {data: {user}} = await supabase.auth.getUser();
    const localizedPath = pathname.replace(/^\/[a-zA-Z-]+(?=\/|$)/, '') || '/';
    if (!user && (/^\/journal(?:\/|$)/.test(localizedPath) || /^\/admin(?:\/|$)/.test(localizedPath))) {
      const target = req.nextUrl.clone();
      target.pathname = '/' + locale + '/login';
      target.searchParams.set('next', pathname + req.nextUrl.search);
      return privateCache(NextResponse.redirect(target));
    }
  } catch (error) {
    console.error('[middleware] Supabase session check failed; continuing with localized response', error);
  }

  authResponse.cookies.getAll().forEach(cookie => intlResponse.cookies.set(cookie));
  return privateCache(intlResponse);
}

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
