import {createServerClient} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';
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
  if (!user && /^\/(journal|admin)/.test(req.nextUrl.pathname)) {
    const u = req.nextUrl.clone(); u.pathname = '/login'; u.searchParams.set('next', req.nextUrl.pathname);
    return NextResponse.redirect(u);
  }
  const opt = {path: '/', maxAge: 31536000, sameSite: 'lax' as const};
  const ip = req.headers.get('x-vercel-ip-country');
  if (!req.cookies.get('country') && ip) res.cookies.set('country', ip.toUpperCase(), opt);
  const al = req.headers.get('accept-language')?.slice(0, 2).toLowerCase();
  if (!req.cookies.get('locale') && al) res.cookies.set('locale', al, opt);
  return res;
}
export const config = {matcher: ['/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook).*)']};
