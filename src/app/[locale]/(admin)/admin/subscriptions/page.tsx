import {Link} from '@/i18n/navigation';
import {supabaseAdmin} from '@/lib/supabase/admin';
import {requireStaff} from '@/lib/admin';

export default async function Subs({searchParams}: {searchParams: {status?: string}}) {
  await requireStaff(true);
  const db = supabaseAdmin();
  let query = db.from('profiles').select('id,email,country,locale,is_premium,premium_status,premium_expires_at,premium_provider,premium_currency,premium_order_id')
    .eq('is_premium', true).order('premium_expires_at', {ascending: true}).limit(300);
  if (searchParams.status === 'active') query = query.gt('premium_expires_at', new Date().toISOString());
  if (searchParams.status === 'manual') query = query.eq('premium_provider', 'manual');
  const {data} = await query;
  const tab = (s: string, label: string) => <Link key={s} href={s ? `/admin/subscriptions?status=${s}` : '/admin/subscriptions'}
    className={`rounded-full px-4 py-2 text-sm font-semibold ${(searchParams.status ?? '') === s ? 'bg-ink text-white' : 'bg-mist'}`}>{label}</Link>;
  return (<div><h1 className="mb-4 font-serif text-3xl font-bold">Premium access</h1>
    <div className="mb-4 flex flex-wrap gap-2">{tab('', 'All premium')}{tab('active', 'Unexpired')}{tab('manual', 'Manual grants')}</div>
    <div className="overflow-x-auto"><table className="tbl"><thead><tr><th>User</th><th>Status</th><th>Provider</th><th>Country / currency</th><th>Expires</th><th>Order</th></tr></thead><tbody>
      {data?.map((p: any) => <tr key={p.id}><td><Link href={`/admin/users/${p.id}`} className="underline">{p.email ?? p.id}</Link></td><td>{p.premium_status ?? 'active'}</td><td>{p.premium_provider ?? 'manual'}</td><td>{p.premium_country ?? p.country ?? '—'} / {p.premium_currency ?? '—'}</td><td>{p.premium_expires_at ? new Date(p.premium_expires_at).toLocaleDateString() : 'No expiry'}</td><td>{p.premium_order_id ?? '—'}</td></tr>)}
    </tbody></table></div></div>);
}
