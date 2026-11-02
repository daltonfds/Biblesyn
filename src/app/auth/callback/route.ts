import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next') || '/home';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/home';
  const cookieStore = cookies();

  if (!code) {
    return NextResponse.redirect(new URL('/login?auth_error=google_callback_failed', url.origin));
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items: {name: string; value: string; options: CookieOptions}[]) {
          // Route Handlers can write cookies directly. This ensures the PKCE
          // exchange persists both auth cookies before the redirect is returned.
          items.forEach(({name, value, options}) => cookieStore.set(name, value, options));
        },
      },
    },
  );

  const {data: authData, error: exchangeError} = await supabase.auth.exchangeCodeForSession(code);
  const user = authData?.user;

  if (exchangeError || !user || !authData.session) {
    const failed = NextResponse.redirect(new URL('/login?auth_error=google_callback_failed', url.origin));
    failed.headers.set('Cache-Control', 'no-store, max-age=0');
    return failed;
  }

  const {data: profile} = await supabase
    .from('profiles')
    .select('locale,country,font_family,font_size')
    .eq('id', user.id)
    .maybeSingle();

  const opt = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
  const countryCookie = cookieStore.get('country')?.value;
  const localeCookie = cookieStore.get('locale')?.value;
  const updates: Record<string, string> = {};

  if (!profile?.country && countryCookie) updates.country = countryCookie.toUpperCase();
  if (!profile?.locale && localeCookie) updates.locale = localeCookie;

  if (Object.keys(updates).length) {
    await supabase.from('profiles').update(updates).eq('id', user.id);
  }

  if (profile?.locale) cookieStore.set('locale', profile.locale, opt);
  if (profile?.country) cookieStore.set('country', profile.country, opt);
  if (profile) {
    cookieStore.set(
      'reader',
      JSON.stringify({f: profile.font_family, s: profile.font_size}),
      opt,
    );
  }

  const response = NextResponse.redirect(new URL(next, url.origin));
  response.headers.set('Cache-Control', 'no-store, max-age=0');
  return response;
}
