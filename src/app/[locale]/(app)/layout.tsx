import Nav from '@/components/Nav';
import {supabaseServer} from '@/lib/supabase/server';
import {getT} from '@/lib/i18n';
import {signOut} from './journal/actions';
export default async function AppLayout({children}: {children: React.ReactNode}) {
  const sb = supabaseServer(); const {data: {user}} = await sb.auth.getUser(); let suspended = false;
  if (user) { const {data: p} = await sb.from('profiles').select('suspended').eq('id', user.id).maybeSingle(); suspended = !!p?.suspended; }
  if (suspended) { const t = await getT(); return (<main className="mx-auto max-w-md px-6 pt-24 text-center"><h1 className="font-serif text-3xl font-bold">{t('account.suspended')}</h1><form action={signOut} className="mt-6"><button className="btn-ink">{t('account.logout')}</button></form></main>); }
  return (<><main className="mx-auto max-w-md pb-28">{children}</main><Nav /></>);
}
