import {createServerClient, type CookieOptions} from '@supabase/ssr';
import {NextResponse} from 'next/server';
import {cookies} from 'next/headers';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const requestedNext = url.searchParams.get('next') || '/';
  const next = requestedNext.startsWith('/') && !requestedNext.startsWith('//') ? requestedNext : '/';
  const response = NextResponse.redirect(new URL(next, url.origin));
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items: {name: string; value: string; options: CookieOptions}[]) {
          items.forEach(({name, value, options}) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  if (!code) {
    return NextResponse.redirect(new URL('/?auth_error=missing_code', url.origin));
  }

  const {error: exchangeError} = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    return NextResponse.redirect(new URL('/?auth_error=google_callback_failed', url.origin));
  }

  const {data: {user}, error: userError} = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(new URL('/?auth_error=session_not_created', url.origin));
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

  if (profile?.locale) response.cookies.set('locale', profile.locale, opt);
  if (profile?.country) response.cookies.set('country', profile.country, opt);
  if (profile) {
    response.cookies.set(
      'reader',
      JSON.stringify({f: profile.font_family, s: profile.font_size}),
      opt,
    );
  }

  return response;
}
